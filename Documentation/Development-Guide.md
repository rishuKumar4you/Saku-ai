# Development Guide

This comprehensive guide provides step-by-step instructions for developers to understand, contribute to, and extend the Saku-AI application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Code Organization](#code-organization)
4. [Adding New Features](#adding-new-features)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Performance Optimization](#performance-optimization)
8. [Deployment](#deployment)

## Getting Started

### Prerequisites

Before starting development, ensure you have:

- **Node.js 18+**: [Download here](https://nodejs.org/)
- **PostgreSQL**: [Download here](https://www.postgresql.org/download/)
- **Git**: [Download here](https://git-scm.com/downloads)
- **Code Editor**: VS Code recommended with extensions:
  - TypeScript and JavaScript Language Features
  - Prisma
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

### Initial Setup

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
   
   Configure the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/saku_ai"
   
   # Authentication
   BETTER_AUTH_SECRET="your-secret-key-here"
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
   
   # Optional: Sentry
   SENTRY_DSN="your-sentry-dsn"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Next.js app
   npm run dev
   
   # Terminal 2: Inngest (background jobs)
   npm run inngest:dev
   ```

6. **Verify setup**
   - Open [http://localhost:3000](http://localhost:3000)
   - You should see the application running
   - Check that Inngest is running on [http://localhost:8288](http://localhost:8288)

## Development Environment

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/      # Main application pages
│   └── api/              # API routes
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

### Development Tools

#### Code Formatting and Linting

The project uses Biome for code formatting and linting:

```bash
# Check for issues
npm run lint

# Fix issues automatically
npm run format
```

#### TypeScript Configuration

The project uses strict TypeScript configuration:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name your-migration-name

# Deploy migrations (production)
npx prisma migrate deploy
```

## Code Organization

### Feature-Based Architecture

Each feature is organized as a self-contained module:

```
src/features/your-feature/
├── components/          # React components
│   ├── your-component.tsx
│   └── index.ts
├── hooks/              # Custom hooks
│   ├── use-your-feature.ts
│   └── index.ts
├── server/             # tRPC routers
│   ├── routers.ts
│   └── index.ts
├── types.ts            # TypeScript types
└── index.ts            # Public exports
```

### Component Guidelines

#### Component Structure

```typescript
// src/features/your-feature/components/your-component.tsx
import { cn } from '@/lib/utils';

interface YourComponentProps {
  className?: string;
  children?: React.ReactNode;
  // ... other props
}

export const YourComponent = ({ 
  className, 
  children,
  ...props 
}: YourComponentProps) => {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {children}
    </div>
  );
};
```

#### Custom Hooks

```typescript
// src/features/your-feature/hooks/use-your-feature.ts
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useYourFeature = () => {
  const trpc = useTRPC();
  
  const query = useQuery(trpc.yourFeature.getItems.queryOptions());
  const mutation = useMutation(trpc.yourFeature.createItem.mutationOptions());
  
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createItem: mutation.mutate,
    isCreating: mutation.isPending,
  };
};
```

### tRPC Router Structure

```typescript
// src/features/your-feature/server/routers.ts
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const yourFeatureRouter = createTRPCRouter({
  getItems: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      // Your query logic here
      return await getItems(input);
    }),

  createItem: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Your mutation logic here
      return await createItem(input);
    }),
});
```

## Adding New Features

### Step 1: Create Feature Structure

```bash
mkdir -p src/features/your-feature/{components,hooks,server}
touch src/features/your-feature/{components,hooks,server}/index.ts
touch src/features/your-feature/types.ts
touch src/features/your-feature/index.ts
```

### Step 2: Define Database Schema

```prisma
// prisma/schema.prisma
model YourModel {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Step 3: Create Migration

```bash
npx prisma migrate dev --name add-your-model
npx prisma generate
```

### Step 4: Implement tRPC Router

```typescript
// src/features/your-feature/server/routers.ts
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/db";

export const yourFeatureRouter = createTRPCRouter({
  getItems: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      
      const [items, totalCount] = await Promise.all([
        prisma.yourModel.findMany({
          where: { userId: ctx.auth.user.id },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.yourModel.count({
          where: { userId: ctx.auth.user.id },
        }),
      ]);
      
      return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: page * pageSize < totalCount,
      };
    }),

  createItem: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.yourModel.create({
        data: {
          ...input,
          userId: ctx.auth.user.id,
        },
      });
    }),

  updateItem: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.yourModel.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),

  deleteItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.yourModel.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
});
```

### Step 5: Register Router

```typescript
// src/trpc/routers/_app.ts
import { yourFeatureRouter } from '@/features/your-feature/server/routers';

export const appRouter = createTRPCRouter({
  yourFeature: yourFeatureRouter,
  // ... other routers
});
```

### Step 6: Create Client Hooks

```typescript
// src/features/your-feature/hooks/use-your-feature.ts
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useYourFeature = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  const query = useQuery(trpc.yourFeature.getItems.queryOptions());
  
  const createItem = useMutation(
    trpc.yourFeature.createItem.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Item "${data.name}" created`);
        queryClient.invalidateQueries(trpc.yourFeature.getItems.queryOptions());
      },
      onError: (error) => {
        toast.error(`Failed to create item: ${error.message}`);
      },
    })
  );
  
  const updateItem = useMutation(
    trpc.yourFeature.updateItem.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Item "${data.name}" updated`);
        queryClient.invalidateQueries(trpc.yourFeature.getItems.queryOptions());
      },
      onError: (error) => {
        toast.error(`Failed to update item: ${error.message}`);
      },
    })
  );
  
  const deleteItem = useMutation(
    trpc.yourFeature.deleteItem.mutationOptions({
      onSuccess: () => {
        toast.success('Item deleted');
        queryClient.invalidateQueries(trpc.yourFeature.getItems.queryOptions());
      },
      onError: (error) => {
        toast.error(`Failed to delete item: ${error.message}`);
      },
    })
  );
  
  return {
    items: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createItem: createItem.mutate,
    updateItem: updateItem.mutate,
    deleteItem: deleteItem.mutate,
    isCreating: createItem.isPending,
    isUpdating: updateItem.isPending,
    isDeleting: deleteItem.isPending,
  };
};
```

### Step 7: Create UI Components

```typescript
// src/features/your-feature/components/your-feature-list.tsx
import { useYourFeature } from '../hooks/use-your-feature';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const YourFeatureList = () => {
  const { items, isLoading, deleteItem, isDeleting } = useYourFeature();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="space-y-4">
      {items?.items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{item.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{item.description}</p>
            <Button
              variant="destructive"
              onClick={() => deleteItem({ id: item.id })}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

### Step 8: Create Page

```typescript
// src/app/(dashboard)/your-feature/page.tsx
import { YourFeatureList } from '@/features/your-feature/components/your-feature-list';
import { YourFeatureForm } from '@/features/your-feature/components/your-feature-form';

export default function YourFeaturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Feature</h1>
        <p className="text-muted-foreground">
          Manage your items
        </p>
      </div>
      
      <YourFeatureForm />
      <YourFeatureList />
    </div>
  );
}
```

### Step 9: Add Navigation

```typescript
// src/components/app-sidebar.tsx
const menuItems = [
  {
    title: "Main",
    items: [
      {
        title: "Your Feature",
        url: "/your-feature",
        icon: YourIcon,
      },
      // ... other items
    ],
  },
];
```

## Testing

### Unit Testing

```typescript
// src/features/your-feature/__tests__/your-feature.test.ts
import { render, screen } from '@testing-library/react';
import { YourComponent } from '../components/your-component';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### Integration Testing

```typescript
// src/features/your-feature/__tests__/integration.test.ts
import { createTRPCMsw } from 'msw-trpc';
import { appRouter } from '@/trpc/routers/_app';

const trpcMsw = createTRPCMsw(appRouter);

export const handlers = [
  trpcMsw.yourFeature.getItems.query(() => {
    return {
      items: [],
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
    };
  }),
];
```

### API Testing

```typescript
// src/app/api/__tests__/your-endpoint.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../your-endpoint/route';

describe('/api/your-endpoint', () => {
  it('should return 200', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
```

## Debugging

### Development Tools

#### React Developer Tools
- Install the React Developer Tools browser extension
- Use the Profiler to identify performance issues
- Inspect component state and props

#### tRPC Devtools
```typescript
// Enable tRPC devtools in development
if (process.env.NODE_ENV === 'development') {
  import('@trpc/devtools');
}
```

#### Database Debugging
```bash
# View database in Prisma Studio
npx prisma studio

# Check database connection
npx prisma db pull

# View migration status
npx prisma migrate status
```

### Common Issues

#### 1. Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready

# Test connection
psql -h localhost -U username -d saku_ai
```

#### 2. Environment Variables
```bash
# Check if all required variables are set
node -e "console.log(process.env.DATABASE_URL)"
```

#### 3. TypeScript Errors
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Generate Prisma types
npx prisma generate
```

## Performance Optimization

### Database Optimization

```typescript
// Use select to fetch only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
});

// Use include wisely to avoid N+1 queries
const users = await prisma.user.findMany({
  include: { workflows: true },
});

// Implement pagination for large datasets
const workflows = await prisma.workflow.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
});
```

### React Optimization

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive rendering */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Use useCallback for stable function references
const handleClick = useCallback(() => {
  // handle click
}, [dependency]);
```

### API Optimization

```typescript
// Implement caching for expensive operations
const cachedResult = await redis.get(`cache-key-${id}`);
if (cachedResult) {
  return JSON.parse(cachedResult);
}

const result = await expensiveOperation();
await redis.setex(`cache-key-${id}`, 3600, JSON.stringify(result));
return result;
```

## Deployment

### Environment Setup

1. **Production Database**
   - Set up PostgreSQL instance
   - Configure connection string
   - Run migrations: `npx prisma migrate deploy`

2. **Environment Variables**
   - Set all required environment variables
   - Use production API keys
   - Configure CORS and security settings

3. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

### Monitoring

#### Sentry Integration
```typescript
// Error tracking
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(error);
```

#### Performance Monitoring
```typescript
// Custom performance metrics
const startTime = Date.now();
// ... operation
const duration = Date.now() - startTime;
console.log(`Operation took ${duration}ms`);
```

### Health Checks

```typescript
// Database health check
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

This comprehensive development guide provides all the information needed to contribute effectively to the Saku-AI application.
