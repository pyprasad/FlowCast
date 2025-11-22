# CreatorFlow - Multi-Platform Creator OS

A production-grade SaaS platform that enables content creators to upload videos once, automatically render them for multiple platforms, schedule posts, track analytics, and manage engagement across TikTok, YouTube Shorts, Instagram Reels, and more.

## 🏗️ Architecture

CreatorFlow is built on a **loosely coupled microservices architecture** with the following components:

- **API Gateway** (Port 4000): Single entry point with routing, auth, and rate limiting
- **Auth Service** (Port 4001): User authentication with JWT
- **Billing Service** (Port 4002): Stripe integration for subscriptions
- **API Keys Service** (Port 4003): Programmatic access management
- **Platform Service** (Port 4004): OAuth integrations (TikTok, YouTube, Instagram)
- **Video Service** (Port 4005): FFmpeg-based video processing
- **Scheduler Service** (Port 4006): Cron-based post scheduling
- **Analytics Service** (Port 4007): Multi-platform stats collection
- **Comments Service** (Port 4008): Unified comment management
- **AI Advisor Service** (Port 4009): Content recommendations
- **Web Frontend** (Port 5173): React + TypeScript + Tailwind

## 🚀 Phase 2: Advanced Creator Intelligence (NEW!)

Phase 2 dramatically extends CreatorFlow with advanced, AI-powered features:

1. **Auto-Viral Optimization Engine** - Analyzes videos pre-publish with actionable suggestions (hook strength, pacing, silence detection)
2. **CreatorPreset™** - Style templates (MrBeast, Podcast, Meme, etc.) with one-click application
3. **AI Thumbnail Frame Injection** - Generate high-impact frames for platform thumbnails
4. **Real-Time Performance Prediction** - Predict views/engagement before posting
5. **Competitor Intelligence** - Track competitor content and performance
6. **AI Comment Moderator** - Auto-classify and suggest replies in your brand voice
7. **A/B Testing** - Run experiments with multiple video variants
8. **Creator "Brain"** - Knowledge graph of your content with opportunity detection
9. **Content Recycler** - Identify high-potential old videos to repost
10. **Weekly Growth Report** - Automated digest with insights and recommendations

**📖 See `docs/PHASE2_IMPLEMENTATION.md` for complete implementation details**

**New Services:**
- **Competitor Service** (Port 4010): Track and analyze competitor activity
- **Presets Package**: Shared library of style templates

**Extended Services:**
- AI Service: +6 new intelligence modules
- Video Service: +Preset application, thumbnail injection
- Scheduler Service: +A/B testing experiments
- Analytics Service: +Competitor data integration
- Comments Service: +AI classification

## 📁 Repository Structure

```
creatorflow/
├── apps/
│   ├── gateway/              # API Gateway
│   ├── auth-service/         # Authentication service
│   ├── billing-service/      # Stripe billing
│   ├── api-keys-service/     # API key management
│   ├── platform-service/     # Platform OAuth & publishing
│   ├── video-service/        # Video processing with FFmpeg
│   ├── scheduler-service/    # Post scheduling
│   ├── analytics-service/    # Analytics collection
│   ├── comments-service/     # Comment management
│   ├── ai-service/           # AI recommendations
│   └── web-frontend/         # React frontend
├── packages/
│   ├── types/                # Shared TypeScript types
│   ├── config/               # Configuration helpers
│   ├── logger/               # Logging utilities
│   ├── tsconfig/             # Shared TS configs
│   └── eslint-config/        # Shared linting
├── infra/
│   ├── docker/               # Docker Compose setup
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile.service
│   │   └── Dockerfile.frontend
│   └── k8s/                  # Kubernetes manifests
│       ├── namespace.yaml
│       ├── postgres.yaml
│       ├── redis.yaml
│       ├── auth-service.yaml
│       ├── gateway.yaml
│       └── frontend.yaml
├── docs/
│   ├── architecture.md       # System architecture
│   └── IMPLEMENTATION_GUIDE.md # Service patterns
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** 8+
- **Docker** and **Docker Compose**
- **PostgreSQL** 15+
- **Redis** 7+
- **FFmpeg** (for video processing)

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd FlowCast

# Install dependencies
pnpm install

# Build shared packages
pnpm build
```

### 2. Set Up Environment Variables

Each service needs its own `.env` file. Use the `.env.example` files as templates:

```bash
# Auth service
cp apps/auth-service/.env.example apps/auth-service/.env

# Gateway
cp apps/gateway/.env.example apps/gateway/.env

# Repeat for other services...
```

**Important:** Update the following in each `.env` file:
- Database URLs
- JWT secrets
- Stripe API keys (for billing)
- OAuth credentials (for platform integrations)

### 3. Start Infrastructure with Docker

```bash
# Start PostgreSQL and Redis
cd infra/docker
docker-compose up -d postgres redis

# Wait for services to be healthy
docker-compose ps
```

### 4. Run Database Migrations

```bash
# For each service with a database
cd apps/auth-service
pnpm db:generate
pnpm db:migrate

cd ../billing-service
pnpm db:generate
pnpm db:migrate

# Repeat for: platform-service, video-service, scheduler-service,
# analytics-service, comments-service, ai-service
```

### 5. Start Services

**Option A: Start all services with Turbo (recommended for development)**

```bash
# From root directory
pnpm dev
```

**Option B: Start individual services**

```bash
# Terminal 1: Auth Service
cd apps/auth-service
pnpm dev

# Terminal 2: Gateway
cd apps/gateway
pnpm dev

# Terminal 3: Frontend
cd apps/web-frontend
pnpm dev

# Repeat for other services...
```

**Option C: Use Docker Compose for everything**

```bash
cd infra/docker
docker-compose up
```

### 6. Access the Application

- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:4000
- **API Docs:** http://localhost:4000/docs
- **Auth Service:** http://localhost:4001

## 🧪 Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test:unit

# Run tests for specific service
cd apps/auth-service
pnpm test:unit
```

### Integration Tests

```bash
# Requires test database
pnpm test

# E2E tests (requires services running)
pnpm test:e2e
```

### Frontend Tests

```bash
cd apps/web-frontend

# Unit tests
pnpm test

# E2E tests with Playwright
pnpm test:e2e
```

## 📦 Building for Production

### Build All Services

```bash
# From root
pnpm build
```

### Build Docker Images

```bash
# Build all service images
docker-compose -f infra/docker/docker-compose.yml build

# Build specific service
docker build -f infra/docker/Dockerfile.service \
  --build-arg SERVICE_NAME=auth-service \
  -t creatorflow/auth-service:latest .
```

### Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f infra/k8s/

# Or apply individually
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/postgres.yaml
kubectl apply -f infra/k8s/redis.yaml
kubectl apply -f infra/k8s/auth-service.yaml
kubectl apply -f infra/k8s/gateway.yaml
# ... etc
```

## 🔐 Environment Variables

### Required for All Services

```env
NODE_ENV=development|production
PORT=<service-port>
LOG_LEVEL=info|debug|error
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
CORS_ORIGINS=http://localhost:5173
```

### Auth Service Specific

```env
JWT_SECRET=<strong-secret>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
EMAIL_PROVIDER_API_KEY=<api-key>
BCRYPT_ROUNDS=10
```

### Billing Service Specific

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_CREATOR=price_...
STRIPE_PRICE_ID_AGENCY=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
```

### Platform Service Specific

```env
TIKTOK_CLIENT_ID=<client-id>
TIKTOK_CLIENT_SECRET=<client-secret>
TIKTOK_REDIRECT_URI=http://localhost:4000/platforms/callback/tiktok

YOUTUBE_CLIENT_ID=<client-id>
YOUTUBE_CLIENT_SECRET=<client-secret>
YOUTUBE_REDIRECT_URI=http://localhost:4000/platforms/callback/youtube

INSTAGRAM_CLIENT_ID=<client-id>
INSTAGRAM_CLIENT_SECRET=<client-secret>
INSTAGRAM_REDIRECT_URI=http://localhost:4000/platforms/callback/instagram

ENCRYPTION_KEY=<32-char-encryption-key>
```

### Video Service Specific

```env
STORAGE_PROVIDER=local|s3
STORAGE_LOCAL_PATH=./storage
FFMPEG_PATH=ffmpeg
MAX_FILE_SIZE_MB=500
TEMP_DIR=/tmp/creatorflow

# If using S3
S3_BUCKET=<bucket-name>
S3_REGION=<region>
S3_ACCESS_KEY=<access-key>
S3_SECRET_KEY=<secret-key>
```

### AI Service Specific

```env
AI_PROVIDER=local|openai|anthropic
AI_API_KEY=<api-key>
AI_MODEL=gpt-4|claude-3
AI_MAX_TOKENS=4000
```

## 🛠️ Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes in relevant service**
   ```bash
   cd apps/<service-name>
   # Make changes...
   ```

3. **Run tests**
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-feature
   ```

### Adding a New Service

1. Create service directory:
   ```bash
   mkdir apps/new-service
   ```

2. Copy structure from existing service (e.g., auth-service)

3. Update `pnpm-workspace.yaml` (automatic with `apps/*`)

4. Create Prisma schema if needed

5. Add service to:
   - `infra/docker/docker-compose.yml`
   - Gateway proxy routes
   - Kubernetes manifests

### Adding a New Shared Package

1. Create package directory:
   ```bash
   mkdir packages/new-package
   ```

2. Add `package.json`, `tsconfig.json`, and source files

3. Build package:
   ```bash
   cd packages/new-package
   pnpm build
   ```

4. Use in services by adding to dependencies:
   ```json
   {
     "dependencies": {
       "@creatorflow/new-package": "workspace:*"
     }
   }
   ```

## 📚 API Documentation

Each service exposes Swagger/OpenAPI documentation:

- **Gateway:** http://localhost:4000/docs
- **Auth Service:** http://localhost:4001/docs
- **Billing Service:** http://localhost:4002/docs
- etc.

### Example API Calls

**Register a new user:**
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Get user subscription:**
```bash
curl http://localhost:4000/billing/subscription \
  -H "Authorization: Bearer <access-token>"
```

## 🎯 Features

### ✅ Implemented

- [x] User authentication with JWT
- [x] Email verification
- [x] Password reset
- [x] API Gateway with rate limiting
- [x] Microservices architecture
- [x] Shared TypeScript types
- [x] Structured logging
- [x] Docker Compose setup
- [x] Kubernetes manifests
- [x] React frontend with routing
- [x] Responsive UI with Tailwind
- [x] Authentication flow

### 🚧 Implementation Patterns Provided

- Billing service with Stripe
- Platform OAuth integrations
- Video processing with FFmpeg
- Post scheduling with cron
- Analytics collection
- Comment management
- AI content recommendations

See `docs/IMPLEMENTATION_GUIDE.md` for detailed patterns.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- GitHub Issues: <repository-url>/issues
- Documentation: `docs/`
- Architecture: `docs/architecture.md`
- Implementation Guide: `docs/IMPLEMENTATION_GUIDE.md`

## 🎓 Learning Resources

- **Fastify:** https://www.fastify.io/
- **Prisma:** https://www.prisma.io/
- **React Query:** https://tanstack.com/query
- **Tailwind CSS:** https://tailwindcss.com/
- **Docker:** https://docs.docker.com/
- **Kubernetes:** https://kubernetes.io/docs/

## 🔄 CI/CD

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
```

## 📊 Monitoring

### Health Checks

All services expose health endpoints:
- `GET /health` - Liveness probe
- `GET /health/ready` - Readiness probe (checks DB/Redis)

### Metrics

Services are structured to export Prometheus-compatible metrics:
- Request count
- Response times
- Error rates
- Custom business metrics

## 🔒 Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Rotate JWT secrets** regularly in production
3. **Enable HTTPS** in production
4. **Use strong passwords** for databases
5. **Encrypt sensitive data** at rest (OAuth tokens, API keys)
6. **Rate limit** all public endpoints
7. **Validate all inputs** with Zod schemas
8. **Use prepared statements** (Prisma handles this)
9. **Enable CORS** only for trusted origins
10. **Keep dependencies updated**

## 🚀 Scaling Considerations

### Horizontal Scaling

All services are stateless and can be scaled horizontally:

```bash
# Kubernetes
kubectl scale deployment auth-service --replicas=5

# Docker Compose
docker-compose up --scale auth-service=5
```

### Database Scaling

- Use read replicas for analytics queries
- Implement connection pooling (Prisma)
- Consider partitioning for time-series data

### Caching Strategy

- Redis for session storage
- API response caching
- CDN for static assets

### Queue Management

- BullMQ for background jobs
- Separate queues per service
- Job prioritization and retries

## 📈 Performance Tips

1. **Use indexes** on frequently queried columns
2. **Batch operations** where possible
3. **Implement pagination** for large datasets
4. **Use CDN** for video delivery
5. **Enable gzip compression**
6. **Optimize images and assets**
7. **Use Redis caching** strategically
8. **Monitor slow queries**

---

**Built with ❤️ for content creators worldwide**
