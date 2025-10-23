# Authentication & Authorization Guide

This document provides comprehensive information about the authentication system, authorization patterns, and security implementation in the Saku-AI application.

## Table of Contents

1. [Overview](#overview)
2. [Authentication System](#authentication-system)
3. [Authorization Levels](#authorization-levels)
4. [Implementation Details](#implementation-details)
5. [Security Features](#security-features)
6. [Subscription Integration](#subscription-integration)
7. [Best Practices](#best-practices)

## Overview

The Saku-AI application uses Better Auth for authentication with Polar integration for subscription management. The system supports:

- Email/password authentication
- Session management
- Subscription-based authorization
- OAuth account linking
- Secure session handling

## Authentication System

### Better Auth Configuration

```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { checkout, polar, portal } from '@polar-sh/better-auth';
import prisma from '@/lib/db';
import { polarClient } from './polar';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [{
            productId: '58225152-88a3-4a44-a85a-e4c984559434',
            slug: 'pro',
          }],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
});
```

### Client-Side Authentication

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
});
```

## Authorization Levels

### 1. Public Routes
No authentication required.

```typescript
// Example: Landing page, login page
export default function PublicPage() {
  return <div>Public content</div>;
}
```

### 2. Protected Routes
Requires valid user session.

```typescript
// src/trpc/init.ts
export const protectedProcedure = baseProcedure.use(async ({ctx, next}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({ctx: {...ctx, auth: session}});
});
```

### 3. Premium Routes
Requires active subscription.

```typescript
// src/trpc/init.ts
export const premiumProcedure = protectedProcedure.use(
  async ({ctx, next}) => {
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.auth.user.id,
    });
    if (!customer.activeSubscriptions || 
        customer.activeSubscriptions.length == 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Active subscription required',
      });
    }
    return next({ctx: {...ctx, customer}});
  },
);
```

## Implementation Details

### Server-Side Authentication

#### Middleware for Route Protection

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/signup')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
```

#### Page-Level Protection

```typescript
// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return <div>Dashboard content</div>;
}
```

### Client-Side Authentication

#### Authentication Hooks

```typescript
// src/hooks/use-auth.ts
import { useSession } from 'better-auth/react';

export function useAuth() {
  const { data: session, isPending, error } = useSession();
  
  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: isPending,
    error,
  };
}
```

#### Protected Component Wrapper

```typescript
// src/components/auth-guard.tsx
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return fallback || <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### API Route Protection

```typescript
// src/app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({ 
    message: 'Protected data',
    user: session.user 
  });
}
```

## Security Features

### Session Management

#### Session Configuration

```typescript
// Better Auth session configuration
export const auth = betterAuth({
  // ... other config
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
});
```

#### Session Validation

```typescript
// Validate session in tRPC procedures
export const protectedProcedure = baseProcedure.use(async ({ctx, next}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  // Check session expiration
  if (new Date() > new Date(session.expiresAt)) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Session expired',
    });
  }
  
  return next({ctx: {...ctx, auth: session}});
});
```

### Password Security

#### Password Hashing

Better Auth automatically handles password hashing using bcrypt:

```typescript
// Password is automatically hashed
const user = await auth.api.signUpEmail({
  email: 'user@example.com',
  password: 'secure-password',
  name: 'John Doe',
});
```

#### Password Validation

```typescript
// Client-side password validation
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
```

### CSRF Protection

```typescript
// CSRF protection is built into Better Auth
export const auth = betterAuth({
  // ... other config
  csrfProtection: {
    enabled: true,
    secret: process.env.CSRF_SECRET,
  },
});
```

### Rate Limiting

```typescript
// Rate limiting for authentication endpoints
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  
  const { success } = await rateLimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Continue with authentication logic
}
```

## Subscription Integration

### Polar Integration

#### Customer Management

```typescript
// src/lib/polar.ts
import { Polar } from '@polar-sh/sdk';

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: process.env.NODE_ENV !== 'production' ? 'sandbox' : 'production',
});
```

#### Subscription Status Check

```typescript
// src/features/subscriptions/hooks/use-subscriptions.ts
import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';

export const useHasActiveSubscription = () => {
  const { data: customerState, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data } = await authClient.customer.state();
      return data;
    },
  });

  const hasActiveSubscription = customerState?.activeSubscriptions &&
    customerState.activeSubscriptions.length > 0;

  return {
    hasActiveSubscription,
    subscription: customerState?.activeSubscriptions?.[0],
    isLoading,
  };
};
```

#### Premium Feature Access

```typescript
// Premium procedure implementation
export const premiumProcedure = protectedProcedure.use(
  async ({ctx, next}) => {
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.auth.user.id,
    });
    
    if (!customer.activeSubscriptions || 
        customer.activeSubscriptions.length === 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Active subscription required',
      });
    }
    
    return next({ctx: {...ctx, customer}});
  },
);
```

### Subscription UI Components

#### Upgrade Modal

```typescript
// src/hooks/use-upgrade-modal.tsx
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handleUpgrade = () => {
    authClient.checkout({ slug: 'pro' });
  };

  const handleError = (error: any) => {
    if (error.code === 'FORBIDDEN') {
      setIsOpen(true);
    }
  };

  const modal = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Required</DialogTitle>
          <DialogDescription>
            This feature requires a Pro subscription.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleUpgrade}>
          Upgrade to Pro
        </Button>
      </DialogContent>
    </Dialog>
  );

  return { modal, handleError, isOpen, setIsOpen };
}
```

## Best Practices

### Authentication Best Practices

1. **Always Validate Sessions**
   ```typescript
   // Check session validity before operations
   const session = await auth.api.getSession({ headers });
   if (!session || new Date() > new Date(session.expiresAt)) {
     throw new Error('Invalid session');
   }
   ```

2. **Use HTTPS in Production**
   ```typescript
   // Ensure secure cookies
   export const auth = betterAuth({
     // ... config
     session: {
       cookieOptions: {
         secure: process.env.NODE_ENV === 'production',
         httpOnly: true,
         sameSite: 'strict',
       },
     },
   });
   ```

3. **Implement Proper Error Handling**
   ```typescript
   // Handle authentication errors gracefully
   try {
     const session = await auth.api.getSession({ headers });
     // ... use session
   } catch (error) {
     if (error.code === 'UNAUTHORIZED') {
       redirect('/login');
     }
     throw error;
   }
   ```

### Authorization Best Practices

1. **Principle of Least Privilege**
   ```typescript
   // Only grant necessary permissions
   const userPermissions = await getUserPermissions(user.id);
   if (!userPermissions.includes('workflow:create')) {
     throw new Error('Insufficient permissions');
   }
   ```

2. **Resource Ownership Validation**
   ```typescript
   // Ensure user owns the resource
   const workflow = await prisma.workflow.findFirst({
     where: {
       id: workflowId,
       userId: session.user.id, // Ensure ownership
     },
   });
   ```

3. **Subscription Status Validation**
   ```typescript
   // Check subscription before premium features
   const hasActiveSubscription = await checkSubscriptionStatus(user.id);
   if (!hasActiveSubscription && isPremiumFeature) {
     throw new TRPCError({
       code: 'FORBIDDEN',
       message: 'Premium subscription required',
     });
   }
   ```

### Security Monitoring

```typescript
// Log authentication events
export const auth = betterAuth({
  // ... config
  events: {
    onSignIn: async ({ user, session }) => {
      console.log(`User ${user.id} signed in`);
      // Log to monitoring service
    },
    onSignOut: async ({ user, session }) => {
      console.log(`User ${user.id} signed out`);
    },
    onSessionCreate: async ({ session }) => {
      console.log(`Session created: ${session.id}`);
    },
  },
});
```

### Error Handling

```typescript
// Comprehensive error handling
export function handleAuthError(error: any) {
  switch (error.code) {
    case 'UNAUTHORIZED':
      return { message: 'Please log in to continue', redirect: '/login' };
    case 'FORBIDDEN':
      return { message: 'You need a subscription to access this feature', showUpgrade: true };
    case 'INVALID_CREDENTIALS':
      return { message: 'Invalid email or password' };
    case 'EMAIL_NOT_VERIFIED':
      return { message: 'Please verify your email address' };
    default:
      return { message: 'An error occurred. Please try again.' };
  }
}
```

## Testing Authentication

### Unit Tests

```typescript
// Test authentication procedures
describe('Authentication', () => {
  it('should require authentication for protected routes', async () => {
    const result = await protectedProcedure.query({});
    expect(result).toThrow('UNAUTHORIZED');
  });

  it('should allow authenticated users', async () => {
    const session = await createTestSession();
    const result = await protectedProcedure.query({}, { auth: session });
    expect(result).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// Test full authentication flow
describe('Authentication Flow', () => {
  it('should sign up and sign in user', async () => {
    const user = await auth.api.signUpEmail({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

This comprehensive authentication guide provides all the information needed to understand, implement, and extend the authentication system in the Saku-AI application.
