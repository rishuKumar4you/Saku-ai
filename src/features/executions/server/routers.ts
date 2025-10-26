import {ExecutionStatus} from '@/generated/prisma';
import {inngest} from '@/ingest/client';
import prisma from '@/lib/db';
import {createTRPCRouter, protectedProcedure} from '@/trpc/init';
import z from 'zod';

export const executionsRouter = createTRPCRouter({
  // Get all executions for a workflow
  getByWorkflow:
      protectedProcedure
          .input(z.object({
            workflowId: z.string(),
          }))
          .query(async ({ctx, input}) => {
            return prisma.execution.findMany({
              where: {
                workflowId: input.workflowId,
                workflow: {
                  userId: ctx.auth.user.id,  // Ensure user can only access
                                             // their own workflow executions
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            });
          }),

  // Get all executions for the current user
  getAll: protectedProcedure.query(async ({ctx}) => {
    return prisma.execution.findMany({
      where: {
        workflow: {
          userId: ctx.auth.user.id,
        },
      },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),

  // Get a specific execution
  getById: protectedProcedure
               .input(z.object({
                 id: z.string(),
               }))
               .query(async ({ctx, input}) => {
                 return prisma.execution.findFirst({
                   where: {
                     id: input.id,
                     workflow: {
                       userId: ctx.auth.user.id,
                     },
                   },
                   include: {
                     workflow: {
                       select: {
                         id: true,
                         name: true,
                       },
                     },
                   },
                 });
               }),

  // Start a workflow execution
  start: protectedProcedure
             .input(z.object({
               workflowId: z.string(),
             }))
             .mutation(async ({ctx, input}) => {
               // First, validate that the workflow exists and belongs to the
               // user
               const workflow = await prisma.workflow.findFirst({
                 where: {
                   id: input.workflowId,
                   userId: ctx.auth.user.id,
                 },
                 include: {
                   nodes: true,
                   connections: true,
                 },
               });

               if (!workflow) {
                 throw new Error('Workflow not found');
               }

               // Validate workflow configuration
               const validationResult = await validateWorkflowConfiguration(
                   workflow, ctx.auth.user.id);
               if (!validationResult.isValid) {
                 throw new Error(validationResult.error);
               }

               // Create execution record
               const execution = await prisma.execution.create({
                 data: {
                   workflowId: input.workflowId,
                   status: ExecutionStatus.PENDING,
                 },
               });

               // For development, execute directly without Inngest
               if (process.env.NODE_ENV === 'development') {
                 console.log('Development mode: executing workflow directly');

                 // Execute workflow directly in development
                 try {
                   const {executeWorkflowDirectly} =
                       await import('@/ingest/direct-execution');
                   await executeWorkflowDirectly(
                       execution.id, workflow, ctx.auth.user.id);
                 } catch (error) {
                   console.error('Direct execution error:', error);
                   // Update execution with error
                   await prisma.execution.update({
                     where: {id: execution.id},
                     data: {
                       status: ExecutionStatus.FAILED,
                       error: error instanceof Error ? error.message :
                                                       'Unknown error',
                       completedAt: new Date(),
                       updatedAt: new Date(),
                     },
                   });
                   throw error;
                 }
               } else {
                 // Trigger background execution with Inngest
                 console.log('Triggering Inngest execution:', {
                   executionId: execution.id,
                   workflowId: input.workflowId,
                   userId: ctx.auth.user.id,
                 });

                 await inngest.send({
                   name: 'workflow/execute',
                   data: {
                     executionId: execution.id,
                     workflowId: input.workflowId,
                     userId: ctx.auth.user.id,
                   },
                 });

                 console.log('Inngest execution triggered successfully');
               }

               return execution;
             }),

  // Cancel an execution
  cancel: protectedProcedure
              .input(z.object({
                executionId: z.string(),
              }))
              .mutation(async ({ctx, input}) => {
                const execution = await prisma.execution.findFirst({
                  where: {
                    id: input.executionId,
                    workflow: {
                      userId: ctx.auth.user.id,
                    },
                  },
                });

                if (!execution) {
                  throw new Error('Execution not found');
                }

                if (execution.status === ExecutionStatus.COMPLETED ||
                    execution.status === ExecutionStatus.FAILED) {
                  throw new Error(
                      'Cannot cancel completed or failed execution');
                }

                return prisma.execution.update({
                  where: {
                    id: input.executionId,
                  },
                  data: {
                    status: ExecutionStatus.CANCELLED,
                    completedAt: new Date(),
                    updatedAt: new Date(),
                  },
                });
              }),

  // Update execution status (for internal use)
  updateStatus:
      protectedProcedure
          .input(z.object({
            executionId: z.string(),
            status: z.nativeEnum(ExecutionStatus),
            error: z.string().optional(),
            result: z.any().optional(),
            logs: z.any().optional(),
          }))
          .mutation(async ({input}) => {
            return prisma.execution.update({
              where: {
                id: input.executionId,
              },
              data: {
                status: input.status,
                error: input.error,
                result: input.result,
                logs: input.logs,
                completedAt: input.status === ExecutionStatus.COMPLETED ||
                        input.status === ExecutionStatus.FAILED ?
                    new Date() :
                    null,
                updatedAt: new Date(),
              },
            });
          }),
});

// Helper function to validate workflow configuration
async function validateWorkflowConfiguration(workflow: any, userId: string) {
  try {
    // Check if workflow has nodes
    if (!workflow.nodes || workflow.nodes.length === 0) {
      return {isValid: false, error: 'Workflow has no nodes'};
    }

    // Check if workflow has at least one trigger node
    const triggerNodes = workflow.nodes.filter(
        (node: any) => node.type === 'MANUAL_TRIGGER' ||
            node.type === 'EMAIL_TRIGGER' || node.type === 'SCHEDULE_TRIGGER');

    if (triggerNodes.length === 0) {
      return {
        isValid: false,
        error: 'Workflow must have at least one trigger node'
      };
    }

    // Check if all AI nodes have required credentials
    const aiNodes = workflow.nodes.filter(
        (node: any) => node.type === 'AI_OPENAI' || node.type === 'AI_GEMINI' ||
            node.type === 'AI_ANTHROPIC');

    for (const node of aiNodes) {
      let credentialType;
      switch (node.type) {
        case 'AI_OPENAI':
          credentialType = 'OPENAI_API_KEY';
          break;
        case 'AI_GEMINI':
          credentialType = 'GEMINI_API_KEY';
          break;
        case 'AI_ANTHROPIC':
          credentialType = 'ANTHROPIC_API_KEY';
          break;
      }

      const credential = await prisma.credential.findUnique({
        where: {
          userId_type: {
            userId,
            type: credentialType as any,
          },
        },
      });

      if (!credential || !credential.isActive) {
        return {
          isValid: false,
          error: `Missing or inactive ${credentialType} credential`
        };
      }
    }

    // Check if email nodes have Gmail OAuth
    const emailNodes = workflow.nodes.filter(
        (node: any) => node.type === 'EMAIL' || node.type === 'EMAIL_TRIGGER');

    if (emailNodes.length > 0) {
      const gmailCredential = await prisma.credential.findUnique({
        where: {
          userId_type: {
            userId,
            type: 'GMAIL_OAUTH',
          },
        },
      });

      if (!gmailCredential || !gmailCredential.isActive) {
        return {
          isValid: false,
          error: 'Missing or inactive Gmail OAuth credential'
        };
      }
    }

    // Check if all nodes are properly configured
    for (const node of workflow.nodes) {
      // Skip validation for manual trigger nodes as they don't need
      // configuration
      if (node.type === 'MANUAL_TRIGGER') {
        continue;
      }

      if (!node.data || Object.keys(node.data).length === 0) {
        return {isValid: false, error: `Node ${node.name} is not configured`};
      }
    }

    return {isValid: true};
  } catch (error) {
    return {isValid: false, error: 'Failed to validate workflow configuration'};
  }
}
