# Saku-AI Documentation

Welcome to the Saku-AI documentation! This comprehensive guide will help you understand the codebase architecture, development patterns, and how to extend the application with new features.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Core Systems](#core-systems)
5. [Development Guide](#development-guide)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Authentication & Authorization](#authentication--authorization)
9. [Adding New Features](#adding-new-features)
10. [Deployment](#deployment)

## 🚀 Project Overview

Saku-AI is a modern workflow automation platform built with Next.js 15, featuring:

- **AI-Powered Workflows**: Execute complex AI tasks using multiple providers (OpenAI, Anthropic, Google)
- **User Authentication**: Secure authentication with Better Auth
- **Subscription Management**: Integrated billing with Polar
- **Real-time Processing**: Background job processing with Inngest
- **Type-Safe APIs**: Full-stack type safety with tRPC
- **Modern UI**: Beautiful interface with Radix UI and Tailwind CSS

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes, tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with Polar integration
- **Background Jobs**: Inngest
- **AI Providers**: OpenAI, Anthropic, Google Gemini
- **UI**: Radix UI, Tailwind CSS, Lucide Icons
- **State Management**: TanStack Query
- **Monitoring**: Sentry

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (tRPC/API)    │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React 19      │    │ • Better Auth   │    │ • OpenAI        │
│ • TanStack Query│    │ • Prisma ORM    │    │ • Anthropic     │
│ • Radix UI      │    │ • Inngest       │    │ • Google Gemini │
│ • Tailwind CSS  │    │ • Polar         │    │ • Sentry        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┼───────────────────────────────┐
                                 │                               │
                    ┌─────────────────┐              ┌─────────────────┐
                    │   Database      │              │   Background   │
                    │   (PostgreSQL)  │              │   Jobs         │
                    │                 │              │   (Inngest)    │
                    │ • Users         │              │                 │
                    │ • Workflows     │              │ • AI Execution │
                    │ • Sessions      │              │ • Notifications│
                    │ • Accounts      │              │ • Data Sync    │
                    └─────────────────┘              └─────────────────┘
```

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application pages
│   └── api/               # API routes
├── components/            # Reusable UI components
│   └── ui/               # Base UI components (Radix)
├── features/             # Feature-based modules
│   ├── auth/            # Authentication logic
│   ├── workflows/       # Workflow management
│   └── subscriptions/   # Billing & subscriptions
├── lib/                 # Utility libraries
├── trpc/               # tRPC configuration
├── hooks/              # Custom React hooks
└── ingest/             # Inngest background jobs
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Polar account (for billing)
- API keys for AI providers

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Saku-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Required environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/saku_ai"
   
   # Authentication
   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"
   
   # Polar (Billing)
   POLAR_ACCESS_TOKEN="your-polar-token"
   POLAR_SUCCESS_URL="http://localhost:3000/subscription"
   
   # AI Providers
   OPENAI_API_KEY="your-openai-key"
   ANTHROPIC_API_KEY="your-anthropic-key"
   GOOGLE_API_KEY="your-google-key"
   
   # Inngest
   INNGEST_EVENT_KEY="your-inngest-key"
   INNGEST_SIGNING_KEY="your-signing-key"
   
   # Sentry (Optional)
   SENTRY_DSN="your-sentry-dsn"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Start Inngest (in another terminal)**
   ```bash
   npm run inngest:dev
   ```

## 🔧 Core Systems

### 1. Authentication System

The application uses Better Auth for authentication with Polar integration for subscription management.

**Key Files:**
- `src/lib/auth.ts` - Auth configuration
- `src/lib/auth-client.ts` - Client-side auth utilities
- `src/features/auth/` - Auth components and logic

**Features:**
- Email/password authentication
- Session management
- Subscription integration
- Protected routes

### 2. Database Layer

PostgreSQL with Prisma ORM for type-safe database operations.

**Key Files:**
- `prisma/schema.prisma` - Database schema
- `src/lib/db.ts` - Database connection
- `src/generated/prisma/` - Generated Prisma client

**Models:**
- `User` - User accounts
- `Session` - User sessions
- `Account` - OAuth accounts
- `Workflow` - User workflows

### 3. API Layer (tRPC)

Type-safe API layer using tRPC with React Query integration.

**Key Files:**
- `src/trpc/init.ts` - tRPC configuration
- `src/trpc/routers/_app.ts` - Main router
- `src/features/*/server/routers.ts` - Feature routers

**Procedures:**
- `protectedProcedure` - Requires authentication
- `premiumProcedure` - Requires active subscription

### 4. Background Jobs (Inngest)

Asynchronous job processing for AI workflows.

**Key Files:**
- `src/ingest/client.ts` - Inngest client
- `src/ingest/functions.ts` - Job functions
- `src/app/api/inngest/route.ts` - Inngest endpoint

### 5. UI Components

Modern UI built with Radix UI and Tailwind CSS.

**Key Files:**
- `src/components/ui/` - Base UI components
- `src/components/` - Application components
- `src/app/globals.css` - Global styles

## 📚 Development Guide

### Adding New Features

1. **Create Feature Directory**
   ```
   src/features/your-feature/
   ├── components/     # React components
   ├── hooks/         # Custom hooks
   ├── server/        # tRPC routers
   └── types.ts       # TypeScript types
   ```

2. **Add tRPC Router**
   ```typescript
   // src/features/your-feature/server/routers.ts
   import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
   import { z } from "zod";
   
   export const yourFeatureRouter = createTRPCRouter({
     getItems: protectedProcedure
       .input(z.object({ search: z.string().optional() }))
       .query(async ({ ctx, input }) => {
         // Your logic here
       }),
   });
   ```

3. **Register Router**
   ```typescript
   // src/trpc/routers/_app.ts
   import { yourFeatureRouter } from '@/features/your-feature/server/routers';
   
   export const appRouter = createTRPCRouter({
     yourFeature: yourFeatureRouter,
     // ... other routers
   });
   ```

4. **Create Client Hooks**
   ```typescript
   // src/features/your-feature/hooks/use-your-feature.ts
   import { useTRPC } from '@/trpc/client';
   import { useMutation, useQuery } from '@tanstack/react-query';
   
   export const useYourFeature = () => {
     const trpc = useTRPC();
     return useQuery(trpc.yourFeature.getItems.queryOptions());
   };
   ```

### Adding New API Endpoints

1. **Create API Route**
   ```typescript
   // src/app/api/your-endpoint/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   
   export async function POST(request: NextRequest) {
     // Your logic here
     return NextResponse.json({ success: true });
   }
   ```

### Adding New Background Jobs

1. **Create Job Function**
   ```typescript
   // src/ingest/functions.ts
   export const yourJob = inngest.createFunction(
     { id: 'your-job' },
     { event: 'your/event' },
     async ({ event, step }) => {
       // Your job logic here
     }
   );
   ```

2. **Trigger Job**
   ```typescript
   import { inngest } from '@/ingest/client';
   
   await inngest.send({
     name: 'your/event',
     data: { /* your data */ }
   });
   ```

### Database Operations

1. **Add New Model**
   ```prisma
   // prisma/schema.prisma
   model YourModel {
     id        String   @id @default(cuid())
     name      String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     
     userId String
     user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
   }
   ```

2. **Run Migration**
   ```bash
   npx prisma migrate dev --name add-your-model
   npx prisma generate
   ```

### UI Component Development

1. **Create Component**
   ```typescript
   // src/components/your-component.tsx
   import { cn } from '@/lib/utils';
   
   interface YourComponentProps {
     className?: string;
     children?: React.ReactNode;
   }
   
   export const YourComponent = ({ className, children }: YourComponentProps) => {
     return (
       <div className={cn("your-styles", className)}>
         {children}
       </div>
     );
   };
   ```

2. **Use in Pages**
   ```typescript
   // src/app/your-page/page.tsx
   import { YourComponent } from '@/components/your-component';
   
   export default function YourPage() {
     return <YourComponent />;
   }
   ```

## 🔐 Authentication & Authorization

### Authentication Flow

1. User signs up/logs in via Better Auth
2. Session is created and stored in database
3. User is redirected to dashboard
4. All protected routes check for valid session

### Authorization Levels

- **Public**: No authentication required
- **Protected**: Requires valid session
- **Premium**: Requires active subscription

### Adding Protected Routes

```typescript
// src/app/protected-page/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect('/login');
  }
  
  return <div>Protected content</div>;
}
```

## 🗄️ Database Schema

### Core Models

#### User
```prisma
model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  sessions      Session[]
  accounts      Account[]
  workflows     Workflow[]
}
```

#### Workflow
```prisma
model Workflow {
  id          String   @id @default(cuid())
  name        String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Database Operations

```typescript
// Create
const workflow = await prisma.workflow.create({
  data: {
    name: 'My Workflow',
    userId: user.id,
  },
});

// Read
const workflows = await prisma.workflow.findMany({
  where: { userId: user.id },
  orderBy: { updatedAt: 'desc' },
});

// Update
const updated = await prisma.workflow.update({
  where: { id: workflowId },
  data: { name: 'New Name' },
});

// Delete
await prisma.workflow.delete({
  where: { id: workflowId },
});
```

## 🚀 Deployment

### Environment Setup

1. **Production Database**
   - Set up PostgreSQL instance
   - Configure connection string

2. **Environment Variables**
   - Set all required environment variables
   - Use production API keys

3. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

### Monitoring

- **Sentry**: Error tracking and performance monitoring
- **Inngest**: Background job monitoring
- **Polar**: Subscription and billing analytics

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

## 🤝 Contributing

1. Follow the established patterns
2. Write type-safe code
3. Add proper error handling
4. Update documentation
5. Test your changes

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review existing code patterns
3. Create an issue in the repository

---

*This documentation is maintained alongside the codebase. Please keep it updated when making changes.*
