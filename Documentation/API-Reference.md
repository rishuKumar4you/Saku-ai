# API Reference

This document provides detailed information about the API endpoints, tRPC procedures, and data structures used in the Saku-AI application.

## Table of Contents

1. [tRPC Procedures](#trpc-procedures)
2. [Authentication](#authentication)
3. [Workflows API](#workflows-api)
4. [Data Types](#data-types)
5. [Error Handling](#error-handling)

## tRPC Procedures

### Base Procedures

#### `protectedProcedure`
Requires user authentication. Throws `UNAUTHORIZED` error if no valid session.

```typescript
const protectedProcedure = baseProcedure.use(async ({ctx, next}) => {
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

#### `premiumProcedure`
Requires active subscription. Extends `protectedProcedure` with subscription check.

```typescript
const premiumProcedure = protectedProcedure.use(
  async ({ctx, next}) => {
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.auth.user.id,
    });
    if (!customer.activeSubscriptions || customer.activeSubscriptions.length == 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Active subscription required',
      });
    }
    return next({ctx: {...ctx, customer}});
  },
);
```

## Workflows API

### Router: `workflows`

#### `create`
Creates a new workflow with a randomly generated name.

**Procedure Type**: `premiumProcedure` (requires subscription)

**Input**: None

**Output**: `Workflow`

```typescript
create: premiumProcedure.mutation(({ctx}) => {
  return prisma.workflow.create({
    data: {
      name: generateSlug(3), // Generates random 3-word slug
      userId: ctx.auth.user.id,
    },
  });
})
```

**Example Usage**:
```typescript
const createWorkflow = trpc.workflows.create.useMutation();
const newWorkflow = await createWorkflow.mutateAsync();
```

#### `remove`
Deletes a workflow by ID.

**Procedure Type**: `protectedProcedure`

**Input**:
```typescript
{
  id: string
}
```

**Output**: `Workflow` (deleted workflow)

```typescript
remove: protectedProcedure
  .input(z.object({
    id: z.string()
  }))
  .mutation(({ctx, input}) => {
    return prisma.workflow.delete({
      where: {
        id: input.id,
        userId: ctx.auth.user.id, // Ensures user owns the workflow
      },
    });
  })
```

**Example Usage**:
```typescript
const deleteWorkflow = trpc.workflows.remove.useMutation();
await deleteWorkflow.mutateAsync({ id: "workflow_123" });
```

#### `updateName`
Updates the name of a workflow.

**Procedure Type**: `protectedProcedure`

**Input**:
```typescript
{
  id: string,
  name: string // minimum 1 character
}
```

**Output**: `Workflow` (updated workflow)

```typescript
updateName: protectedProcedure
  .input(z.object({
    id: z.string(), 
    name: z.string().min(1)
  }))
  .mutation(({ctx, input}) => {
    return prisma.workflow.update({
      where: {
        id: input.id,
        userId: ctx.auth.user.id,
      },
      data: {
        name: input.name
      },
    });
  })
```

**Example Usage**:
```typescript
const updateWorkflow = trpc.workflows.updateName.useMutation();
await updateWorkflow.mutateAsync({ 
  id: "workflow_123", 
  name: "My New Workflow Name" 
});
```

#### `getOne`
Retrieves a single workflow by ID.

**Procedure Type**: `protectedProcedure`

**Input**:
```typescript
{
  id: string
}
```

**Output**: `Workflow | null`

```typescript
getOne: protectedProcedure
  .input(z.object({id: z.string()}))
  .query(({ctx, input}) => {
    return prisma.workflow.findUnique({
      where: {
        id: input.id,
        userId: ctx.auth.user.id,
      }
    });
  })
```

**Example Usage**:
```typescript
const { data: workflow } = trpc.workflows.getOne.useQuery({ 
  id: "workflow_123" 
});
```

#### `getMany`
Retrieves paginated list of workflows with search functionality.

**Procedure Type**: `protectedProcedure`

**Input**:
```typescript
{
  page?: number,        // Default: 1
  pageSize?: number,    // Min: 1, Max: 100, Default: 20
  search?: string       // Default: ""
}
```

**Output**:
```typescript
{
  items: Workflow[],
  page: number,
  pageSize: number,
  totalCount: number,
  totalPages: number,
  hasNextPage: boolean,
  hasPreviousPage: boolean
}
```

```typescript
getMany: protectedProcedure
  .input(z.object({
    page: z.number().default(PAGINATION.DEFAULT_PAGE),
    pageSize: z
      .number()
      .min(PAGINATION.MIN_PAGE_SIZE)
      .max(PAGINATION.MAX_PAGE_SIZE)
      .default(PAGINATION.DEFAULT_PAGE_SIZE),
    search: z.string().default(""),
  }))
  .query(async({ ctx, input }) => {
    const { page, pageSize, search } = input;

    const [items, totalCount] = await Promise.all([
      prisma.workflow.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: {
          userId: ctx.auth.user.id,
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.workflow.count({
        where: {
          userId: ctx.auth.user.id,
        },
      }),
    ]);
    
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    return {
      items,
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  })
```

**Example Usage**:
```typescript
const { data: workflows } = trpc.workflows.getMany.useQuery({
  page: 1,
  pageSize: 20,
  search: "my workflow"
});
```

## Data Types

### Workflow

```typescript
interface Workflow {
  id: string;           // CUID identifier
  name: string;         // Workflow name
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
  userId: string;       // Owner user ID
  user: User;           // Owner user object
}
```

### User

```typescript
interface User {
  id: string;                    // User ID
  name: string;                  // Display name
  email: string;                 // Email address
  emailVerified: boolean;        // Email verification status
  image?: string;               // Profile image URL
  createdAt: Date;              // Account creation date
  updatedAt: Date;              // Last update date
  sessions: Session[];          // User sessions
  accounts: Account[];          // OAuth accounts
  workflows: Workflow[];        // User workflows
}
```

### Session

```typescript
interface Session {
  id: string;           // Session ID
  expiresAt: Date;      // Expiration timestamp
  token: string;        // Session token
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
  ipAddress?: string;   // Client IP address
  userAgent?: string;   // Client user agent
  userId: string;       // Associated user ID
  user: User;           // Associated user object
}
```

### Account

```typescript
interface Account {
  id: string;                    // Account ID
  accountId: string;             // Provider account ID
  providerId: string;            // OAuth provider ID
  userId: string;                // Associated user ID
  user: User;                    // Associated user object
  accessToken?: string;         // OAuth access token
  refreshToken?: string;         // OAuth refresh token
  idToken?: string;              // OAuth ID token
  accessTokenExpiresAt?: Date;   // Access token expiration
  refreshTokenExpiresAt?: Date;  // Refresh token expiration
  scope?: string;                // OAuth scope
  password?: string;             // Hashed password
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

## Error Handling

### tRPC Error Codes

#### `UNAUTHORIZED`
- **Code**: `UNAUTHORIZED`
- **Message**: "You must be logged in to access this resource"
- **Cause**: No valid session found
- **Resolution**: Redirect to login page

#### `FORBIDDEN`
- **Code**: `FORBIDDEN`
- **Message**: "Active subscription required"
- **Cause**: User doesn't have active subscription
- **Resolution**: Show upgrade modal or redirect to subscription page

#### `NOT_FOUND`
- **Code**: `NOT_FOUND`
- **Message**: "Resource not found"
- **Cause**: Requested resource doesn't exist or user doesn't have access
- **Resolution**: Show 404 page or error message

#### `BAD_REQUEST`
- **Code**: `BAD_REQUEST`
- **Message**: "Invalid input"
- **Cause**: Input validation failed
- **Resolution**: Show validation errors

### Error Handling in Components

```typescript
// Using React Query with error handling
const { data, error, isLoading } = trpc.workflows.getMany.useQuery(
  { page: 1, pageSize: 20 },
  {
    onError: (error) => {
      toast.error(`Failed to load workflows: ${error.message}`);
    },
  }
);

// Using mutations with error handling
const createWorkflow = trpc.workflows.create.useMutation({
  onSuccess: (data) => {
    toast.success(`Workflow "${data.name}" created`);
    queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions());
  },
  onError: (error) => {
    toast.error(`Failed to create workflow: ${error.message}`);
  },
});
```

### Global Error Handling

```typescript
// Error boundary for catching React errors
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// Usage
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <YourComponent />
</ErrorBoundary>
```

## Client-Side Usage

### React Query Integration

```typescript
// Query with suspense
const { data: workflows } = trpc.workflows.getMany.useSuspenseQuery({
  page: 1,
  pageSize: 20
});

// Mutation with optimistic updates
const updateWorkflow = trpc.workflows.updateName.useMutation({
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(trpc.workflows.getMany.queryOptions());
    
    // Snapshot previous value
    const previousWorkflows = queryClient.getQueryData(
      trpc.workflows.getMany.queryOptions()
    );
    
    // Optimistically update
    queryClient.setQueryData(
      trpc.workflows.getMany.queryOptions(),
      (old) => ({
        ...old,
        items: old.items.map(workflow =>
          workflow.id === variables.id
            ? { ...workflow, name: variables.name }
            : workflow
        )
      })
    );
    
    return { previousWorkflows };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(
      trpc.workflows.getMany.queryOptions(),
      context.previousWorkflows
    );
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions());
  },
});
```

### Custom Hooks

```typescript
// Custom hook for workflow management
export const useWorkflows = () => {
  const trpc = useTRPC();
  
  const workflows = trpc.workflows.getMany.useQuery({
    page: 1,
    pageSize: 20
  });
  
  const createWorkflow = trpc.workflows.create.useMutation({
    onSuccess: () => {
      workflows.refetch();
    }
  });
  
  const updateWorkflow = trpc.workflows.updateName.useMutation({
    onSuccess: () => {
      workflows.refetch();
    }
  });
  
  const deleteWorkflow = trpc.workflows.remove.useMutation({
    onSuccess: () => {
      workflows.refetch();
    }
  });
  
  return {
    workflows: workflows.data,
    isLoading: workflows.isLoading,
    error: workflows.error,
    createWorkflow: createWorkflow.mutate,
    updateWorkflow: updateWorkflow.mutate,
    deleteWorkflow: deleteWorkflow.mutate,
    isCreating: createWorkflow.isPending,
    isUpdating: updateWorkflow.isPending,
    isDeleting: deleteWorkflow.isPending,
  };
};
```

## Pagination Constants

```typescript
// src/config/constants.ts
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE: 100,
} as const;
```

## Type Safety

All API calls are fully type-safe thanks to tRPC. The client automatically infers types from the server procedures, providing:

- **Input validation**: Automatic Zod validation
- **Output typing**: TypeScript types for all responses
- **Error handling**: Typed error responses
- **IntelliSense**: Full autocomplete support

```typescript
// Fully typed API calls
const workflow = await trpc.workflows.getOne.query({ 
  id: "workflow_123" // TypeScript knows this should be a string
});

// workflow is fully typed as Workflow | null
if (workflow) {
  console.log(workflow.name); // TypeScript knows this exists
}
```
