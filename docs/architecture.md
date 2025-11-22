# CreatorFlow - System Architecture

## Overview

CreatorFlow is a multi-platform Creator OS built on a **loosely coupled microservices architecture**. The system enables content creators to upload videos once, automatically render them for multiple platforms, schedule posts, track analytics, and manage engagement across TikTok, YouTube Shorts, Instagram Reels, and more.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Web Frontend                             │
│                   (React + TypeScript + Vite)                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS/REST
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway / BFF                          │
│          (Request Routing, Auth, Rate Limiting)                  │
└─┬───────┬───────┬────────┬────────┬───────┬────────┬──────┬────┘
  │       │       │        │        │       │        │      │
  ▼       ▼       ▼        ▼        ▼       ▼        ▼      ▼
┌────┐ ┌────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐ ┌─────┐ ┌────┐
│Auth│ │Bill│ │ API  │ │Platf.│ │Video │ │Sched│ │Analyt│ │Comm│
│Svc │ │Svc │ │ Keys │ │ Integ│ │ Proc │ │ Pub │ │ Coll │ │Mgmt│
└──┬─┘ └──┬─┘ └───┬──┘ └───┬──┘ └───┬──┘ └──┬─┘ └───┬──┘ └──┬─┘
   │      │       │         │        │       │       │       │
   └──────┴───────┴─────────┴────────┴───────┴───────┴───────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌─────────┐      ┌──────────┐      ┌──────────┐
   │PostgreSQL│      │  Redis   │      │ Object   │
   │         │      │(Cache+Q) │      │ Storage  │
   └─────────┘      └──────────┘      └──────────┘
        │                  │
        └──────────────────┘
                  │
    ┌─────────────┼──────────────┐
    ▼             ▼              ▼
┌────────┐  ┌──────────┐  ┌───────────┐
│ Stripe │  │ Platform │  │   Email   │
│  API   │  │   APIs   │  │  Provider │
└────────┘  └──────────┘  └───────────┘
            (TikTok, YT,
             Instagram)
```

## Service Boundaries

### 1. API Gateway (Port: 4000)
**Responsibilities:**
- Single entry point for all frontend requests
- JWT token validation
- Request routing to microservices
- Rate limiting and request throttling
- CORS handling
- API documentation (Swagger/OpenAPI)

**Dependencies:** All backend services

### 2. Auth Service (Port: 4001)
**Responsibilities:**
- User registration and login
- JWT token generation (access + refresh)
- Password reset workflows
- Email verification
- Session management

**Database Tables:**
- users
- refresh_tokens
- verification_tokens
- password_reset_tokens

### 3. Billing Service (Port: 4002)
**Responsibilities:**
- User profile and workspace management
- Stripe customer and subscription management
- Webhook handling (invoice.paid, subscription.updated, etc.)
- Plan limits enforcement (FREE, CREATOR, AGENCY, ENTERPRISE)
- Usage tracking for token-based billing

**Database Tables:**
- user_profiles
- subscriptions
- payments
- usage_logs

**External Dependencies:**
- Stripe API

### 4. API Keys Service (Port: 4003)
**Responsibilities:**
- Generate and manage API keys for programmatic access
- API key validation middleware
- Key revocation and rotation
- Usage tracking per API key

**Database Tables:**
- api_keys
- api_key_usage

### 5. Platform Integrations Service (Port: 4004)
**Responsibilities:**
- OAuth flow management for all platforms
- Token storage and refresh (encrypted)
- Platform API abstraction layer
- Video publishing to platforms
- Platform capabilities management

**Database Tables:**
- platform_accounts
- oauth_tokens (encrypted)

**External Dependencies:**
- TikTok API
- YouTube Data API
- Instagram Graph API

### 6. Video Processing Service (Port: 4005)
**Responsibilities:**
- Video upload handling
- FFmpeg-based video processing
- Multi-format rendering (9:16, 1:1, 16:9)
- AI subtitle generation (ASR integration)
- Thumbnail extraction
- Progress tracking

**Database Tables:**
- videos
- video_assets
- processing_jobs

**External Dependencies:**
- Object Storage (S3-compatible)
- FFmpeg
- ASR Provider (Whisper API)

### 7. Scheduler & Publishing Service (Port: 4006)
**Responsibilities:**
- Post scheduling management
- Cron-based job execution
- Platform-specific publishing
- Retry logic and error handling
- Publishing history and logs

**Database Tables:**
- scheduled_posts
- published_posts
- publishing_logs

### 8. Analytics Collector Service (Port: 4007)
**Responsibilities:**
- Periodic stats collection from platforms
- Time-series data storage
- Aggregation and normalization
- Rate limit management
- Historical trend analysis

**Database Tables:**
- analytics_snapshots
- analytics_aggregates

### 9. Comments & Engagement Service (Port: 4008)
**Responsibilities:**
- Comment fetching from platforms
- Unified inbox management
- Comment classification (AI-powered)
- Reply management
- Engagement metrics tracking

**Database Tables:**
- comments
- comment_replies
- engagement_metrics

### 10. AI Advisor Service (Port: 4009)
**Responsibilities:**
- Content recommendation engine
- Hashtag suggestions
- Optimal posting time analysis
- Performance insights
- Hook/script generation

**Database Tables:**
- ai_insights
- content_recommendations

**External Dependencies:**
- LLM Provider (OpenAI/Anthropic)

## Data Flow Examples

### Video Upload & Publishing Flow
```
1. User uploads video → Frontend → Gateway → Video Service
2. Video Service → Store raw file → Object Storage
3. Video Service → Enqueue processing job → BullMQ/Redis
4. Worker picks job → FFmpeg processing → Generate variants
5. Store variants metadata → Database
6. Emit "processing.complete" event
7. User schedules post → Scheduler Service
8. At scheduled time → Scheduler → Platform Service → Publish
9. Store published post record → Database
```

### Analytics Collection Flow
```
1. Cron job triggers → Analytics Service
2. For each user's connected accounts:
   3. Fetch video list → Platform Service
   4. For each video → Fetch stats from platform API
   5. Store snapshot → Database
6. Aggregate daily/weekly metrics
7. Frontend polls → Gateway → Analytics Service → Return data
```

### OAuth Connection Flow
```
1. User clicks "Connect YouTube" → Frontend
2. Frontend → Gateway → Platform Service → Get auth URL
3. Redirect user to YouTube OAuth
4. User authorizes → YouTube redirects to callback URL
5. Platform Service → Exchange code for tokens
6. Encrypt and store tokens → Database
7. Return success → Frontend
```

## Technology Stack

### Backend
- **Runtime:** Node.js 20+ with TypeScript 5+
- **Framework:** Fastify (for performance)
- **Database:** PostgreSQL 15+ with Prisma ORM
- **Cache/Queue:** Redis 7+ with BullMQ
- **Auth:** JWT (jsonwebtoken)
- **Testing:** Jest + Supertest + Playwright
- **Logging:** Pino (structured logging)
- **Validation:** Zod
- **API Docs:** @fastify/swagger

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite 5+
- **UI:** Tailwind CSS + Headless UI
- **State:** TanStack Query (React Query)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Testing:** Vitest + React Testing Library + Playwright

### Infrastructure
- **Local:** Docker Compose
- **Production:** Kubernetes
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana (hooks ready)
- **Logging:** ELK Stack compatible (structured JSON logs)

## Security Considerations

1. **Authentication:**
   - JWT with short-lived access tokens (15min)
   - Refresh tokens with rotation
   - HTTP-only cookies for web sessions

2. **Data Protection:**
   - OAuth tokens encrypted at rest (AES-256)
   - API keys hashed (bcrypt)
   - Environment-based secrets management
   - No hardcoded credentials

3. **API Security:**
   - Rate limiting per user/IP
   - CORS configuration
   - Input validation (Zod schemas)
   - SQL injection prevention (Prisma)
   - XSS protection (sanitization)

4. **Infrastructure:**
   - Service-to-service auth (internal API keys)
   - Network isolation (K8s network policies)
   - Secret management (K8s secrets/env vars)

## Scalability Considerations

1. **Horizontal Scaling:**
   - All services are stateless (except for DB/Redis)
   - Can scale independently based on load
   - Load balancing via K8s services

2. **Database:**
   - Connection pooling (Prisma)
   - Read replicas for analytics queries
   - Partitioning for time-series data

3. **Caching:**
   - Redis for session storage
   - API response caching
   - CDN for static assets

4. **Queues:**
   - BullMQ for background jobs
   - Separate queues per service
   - Job prioritization and retries

## Monitoring & Observability

1. **Logging:**
   - Structured JSON logs (Pino)
   - Correlation IDs for request tracing
   - Log levels: error, warn, info, debug

2. **Metrics:**
   - Prometheus-compatible endpoints
   - Key metrics: request rate, latency, error rate
   - Custom business metrics (videos processed, posts published)

3. **Tracing:**
   - Ready for OpenTelemetry integration
   - Service-to-service call tracking

4. **Health Checks:**
   - Liveness probes (service up)
   - Readiness probes (DB/Redis connected)

## Development Workflow

1. **Local Development:**
   ```bash
   # Start infrastructure
   docker-compose up -d postgres redis

   # Start all services
   pnpm dev

   # Run tests
   pnpm test
   ```

2. **Testing Strategy:**
   - Unit tests: Service logic, utilities
   - Integration tests: API endpoints with test DB
   - E2E tests: Critical user flows

3. **CI/CD Pipeline:**
   - Lint + Type check
   - Unit tests
   - Build Docker images
   - Integration tests
   - Deploy to staging
   - E2E tests
   - Deploy to production

## Future Enhancements

1. **Additional Platforms:**
   - Facebook Reels
   - LinkedIn Video
   - Pinterest Idea Pins
   - X/Twitter Video

2. **Advanced Features:**
   - AI-powered video editing
   - A/B testing for titles/thumbnails
   - Collaboration tools for teams
   - White-label solutions

3. **Performance:**
   - GraphQL API option
   - WebSocket for real-time updates
   - Edge caching (Cloudflare)
   - Video transcoding pipeline (AWS MediaConvert)
