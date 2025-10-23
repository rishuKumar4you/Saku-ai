# Deployment Guide

This guide provides comprehensive instructions for deploying the Saku-AI application to production environments.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

## Overview

The Saku-AI application can be deployed to various platforms including:

- **Vercel** (Recommended for Next.js)
- **Railway**
- **DigitalOcean App Platform**
- **AWS/GCP/Azure**
- **Docker containers**

This guide focuses on Vercel deployment with PostgreSQL database.

## Prerequisites

### Required Services

1. **Database**: PostgreSQL instance
   - Railway, Supabase, or AWS RDS
2. **Domain**: Custom domain (optional)
3. **External Services**:
   - Polar account for billing
   - AI provider API keys
   - Inngest account

### Required API Keys

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
BETTER_AUTH_SECRET="your-production-secret"
BETTER_AUTH_URL="https://your-domain.com"

# Polar (Billing)
POLAR_ACCESS_TOKEN="your-polar-token"
POLAR_SUCCESS_URL="https://your-domain.com/subscription"

# AI Providers
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
GOOGLE_API_KEY="your-google-key"

# Inngest
INNGEST_EVENT_KEY="your-inngest-key"
INNGEST_SIGNING_KEY="your-signing-key"

# Optional: Sentry
SENTRY_DSN="your-sentry-dsn"
```

## Environment Setup

### 1. Database Setup

#### Option A: Railway (Recommended)

1. **Create Railway account**: [railway.app](https://railway.app)
2. **Create new project**
3. **Add PostgreSQL service**
4. **Copy connection string**

```bash
# Test connection
psql $DATABASE_URL
```

#### Option B: Supabase

1. **Create Supabase account**: [supabase.com](https://supabase.com)
2. **Create new project**
3. **Go to Settings > Database**
4. **Copy connection string**

#### Option C: AWS RDS

1. **Create RDS instance**
2. **Configure security groups**
3. **Create database user**
4. **Get connection string**

### 2. External Services Setup

#### Polar (Billing)

1. **Create Polar account**: [polar.sh](https://polar.sh)
2. **Create organization**
3. **Set up products and pricing**
4. **Get API keys**

#### Inngest (Background Jobs)

1. **Create Inngest account**: [inngest.com](https://inngest.com)
2. **Create new app**
3. **Get API keys**
4. **Configure webhook URL**

#### AI Providers

1. **OpenAI**: [platform.openai.com](https://platform.openai.com)
2. **Anthropic**: [console.anthropic.com](https://console.anthropic.com)
3. **Google**: [console.cloud.google.com](https://console.cloud.google.com)

## Database Setup

### 1. Run Migrations

```bash
# Install Prisma CLI globally
npm install -g prisma

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 2. Verify Database

```bash
# Check database connection
npx prisma db pull

# View database in Prisma Studio
npx prisma studio
```

### 3. Seed Database (Optional)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed data here
  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

```bash
# Run seed script
npx prisma db seed
```

## Application Deployment

### Vercel Deployment (Recommended)

#### 1. Prepare Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. Connect to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Import your repository**
3. **Configure build settings**

#### 3. Environment Variables

Add all required environment variables in Vercel dashboard:

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=https://your-app.vercel.app
POLAR_ACCESS_TOKEN=your-token
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
GOOGLE_API_KEY=your-key
INNGEST_EVENT_KEY=your-key
INNGEST_SIGNING_KEY=your-key
```

#### 4. Build Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "src/app/api/inngest/route.ts": {
      "maxDuration": 300
    }
  }
}
```

#### 5. Deploy

```bash
# Deploy to Vercel
npx vercel --prod

# Or use Vercel CLI
vercel --prod
```

### Railway Deployment

#### 1. Connect Repository

1. **Go to [railway.app](https://railway.app)**
2. **Create new project**
3. **Connect GitHub repository**

#### 2. Configure Services

```yaml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
```

#### 3. Environment Variables

Set all environment variables in Railway dashboard.

### Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### 2. Create docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      - POLAR_ACCESS_TOKEN=${POLAR_ACCESS_TOKEN}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - INNGEST_EVENT_KEY=${INNGEST_EVENT_KEY}
      - INNGEST_SIGNING_KEY=${INNGEST_SIGNING_KEY}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=saku_ai
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### 3. Deploy with Docker

```bash
# Build and run
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

## Monitoring & Maintenance

### 1. Health Checks

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

### 2. Sentry Integration

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 3. Logging

```typescript
// src/lib/logger.ts
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});
```

### 4. Performance Monitoring

```typescript
// src/lib/metrics.ts
export const metrics = {
  requestCount: 0,
  requestDuration: 0,
  errorCount: 0,
};

export function recordRequest(duration: number) {
  metrics.requestCount++;
  metrics.requestDuration += duration;
}

export function recordError() {
  metrics.errorCount++;
}
```

### 5. Database Monitoring

```typescript
// src/lib/db-monitor.ts
export async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime: duration,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check database connection
npx prisma db pull

# Test connection string
psql $DATABASE_URL

# Check if database is accessible
npx prisma migrate status
```

#### 2. Environment Variables

```bash
# Check if all variables are set
node -e "console.log(Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('AUTH') || k.includes('POLAR')))"
```

#### 3. Build Issues

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### 4. Migration Issues

```bash
# Reset database (development only)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Apply pending migrations
npx prisma migrate deploy
```

### Debugging Production Issues

#### 1. Enable Debug Logging

```typescript
// Enable Prisma logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

#### 2. Check Application Logs

```bash
# Vercel logs
vercel logs

# Railway logs
railway logs

# Docker logs
docker-compose logs app
```

#### 3. Database Debugging

```bash
# Connect to production database
psql $DATABASE_URL

# Check table structure
\dt

# Check data
SELECT * FROM "user" LIMIT 5;
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_workflow_user_id ON "Workflow"("userId");
CREATE INDEX idx_workflow_created_at ON "Workflow"("createdAt");
CREATE INDEX idx_session_user_id ON "Session"("userId");
```

#### 2. Application Optimization

```typescript
// Enable compression
// next.config.ts
const nextConfig = {
  compress: true,
  poweredByHeader: false,
};
```

#### 3. CDN Configuration

```typescript
// Configure CDN for static assets
const nextConfig = {
  images: {
    domains: ['your-cdn-domain.com'],
  },
};
```

### Security Checklist

- [ ] Environment variables are secure
- [ ] Database connection is encrypted
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] Authentication is working
- [ ] HTTPS is enabled
- [ ] Security headers are set

### Backup Strategy

#### 1. Database Backups

```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

#### 2. Automated Backups

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "backup_$DATE.sql"
aws s3 cp "backup_$DATE.sql" s3://your-backup-bucket/
```

### Scaling Considerations

#### 1. Database Scaling

- Use connection pooling
- Implement read replicas
- Consider database sharding

#### 2. Application Scaling

- Use horizontal scaling
- Implement caching
- Use CDN for static assets

#### 3. Background Jobs

- Scale Inngest workers
- Implement job queuing
- Monitor job performance

This deployment guide provides comprehensive instructions for deploying the Saku-AI application to production environments with proper monitoring and maintenance procedures.
