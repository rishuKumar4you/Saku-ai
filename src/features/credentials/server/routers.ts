import {CredentialType} from '@/generated/prisma';
import prisma from '@/lib/db';
import {createTRPCRouter, protectedProcedure} from '@/trpc/init';
import z from 'zod';

export const credentialsRouter = createTRPCRouter({
  // Get all credentials for the current user
  getAll: protectedProcedure.query(async ({ctx}) => {
    return prisma.credential.findMany({
      where: {
        userId: ctx.auth.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),

  // Get a specific credential by type
  getByType: protectedProcedure
                 .input(z.object({
                   type: z.nativeEnum(CredentialType),
                 }))
                 .query(async ({ctx, input}) => {
                   return prisma.credential.findUnique({
                     where: {
                       userId_type: {
                         userId: ctx.auth.user.id,
                         type: input.type,
                       },
                     },
                   });
                 }),

  // Create or update an API key credential
  upsertApiKey:
      protectedProcedure
          .input(z.object({
            type: z.enum([
              CredentialType.OPENAI_API_KEY, CredentialType.GEMINI_API_KEY,
              CredentialType.ANTHROPIC_API_KEY
            ]),
            name: z.string().min(1, 'Name is required'),
            apiKey: z.string().min(1, 'API key is required'),
          }))
          .mutation(async ({ctx, input}) => {
            return prisma.credential.upsert({
              where: {
                userId_type: {
                  userId: ctx.auth.user.id,
                  type: input.type,
                },
              },
              update: {
                name: input.name,
                apiKey: input.apiKey,
                isActive: true,
                updatedAt: new Date(),
              },
              create: {
                userId: ctx.auth.user.id,
                type: input.type,
                name: input.name,
                apiKey: input.apiKey,
                isActive: true,
              },
            });
          }),

  // Create or update Gmail OAuth credential
  upsertGmailOAuth:
      protectedProcedure
          .input(z.object({
            accessToken: z.string().min(1, 'Access token is required'),
            refreshToken: z.string().optional(),
            expiresAt: z.date().optional(),
            scope: z.string().optional(),
          }))
          .mutation(async ({ctx, input}) => {
            return prisma.credential.upsert({
              where: {
                userId_type: {
                  userId: ctx.auth.user.id,
                  type: CredentialType.GMAIL_OAUTH,
                },
              },
              update: {
                accessToken: input.accessToken,
                refreshToken: input.refreshToken,
                expiresAt: input.expiresAt,
                scope: input.scope,
                isActive: true,
                updatedAt: new Date(),
              },
              create: {
                userId: ctx.auth.user.id,
                type: CredentialType.GMAIL_OAUTH,
                name: 'Gmail OAuth',
                accessToken: input.accessToken,
                refreshToken: input.refreshToken,
                expiresAt: input.expiresAt,
                scope: input.scope,
                isActive: true,
              },
            });
          }),

  // Toggle credential active status
  toggleActive:
      protectedProcedure
          .input(z.object({
            id: z.string(),
            isActive: z.boolean(),
          }))
          .mutation(async ({ctx, input}) => {
            return prisma.credential.update({
              where: {
                id: input.id,
                userId: ctx.auth.user.id,  // Ensure user can only update their
                                           // own credentials
              },
              data: {
                isActive: input.isActive,
                updatedAt: new Date(),
              },
            });
          }),

  // Delete a credential
  delete: protectedProcedure
              .input(z.object({
                id: z.string(),
              }))
              .mutation(async ({ctx, input}) => {
                return prisma.credential.delete({
                  where: {
                    id: input.id,
                    userId: ctx.auth.user.id,  // Ensure user can only delete
                                               // their own credentials
                  },
                });
              }),

  // Test API key validity (for AI services)
  testApiKey:
      protectedProcedure
          .input(z.object({
            type: z.enum([
              CredentialType.OPENAI_API_KEY, CredentialType.GEMINI_API_KEY,
              CredentialType.ANTHROPIC_API_KEY
            ]),
            apiKey: z.string().min(1, 'API key is required'),
          }))
          .mutation(async ({input}) => {
            // This will be implemented to test the API key with the respective
            // service For now, we'll just return a success response In the
            // execution phase, we'll implement actual API testing
            return {
              success: true,
              message: 'API key test will be implemented in execution phase',
            };
          }),
});
