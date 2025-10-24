import prisma from '@/lib/db';
import {createTRPCRouter, protectedProcedure} from '@/trpc/init';
import {z} from 'zod';

export const userSettingsRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ctx}) => {
    const user = await prisma.user.findUnique({
      where: {id: ctx.auth.user.id},
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }),

  updateProfile: protectedProcedure
                     .input(z.object({
                       firstName: z.string().min(1, 'First name is required'),
                       lastName: z.string().min(1, 'Last name is required'),
                       image: z.string().optional(),
                     }))
                     .mutation(async ({ctx, input}) => {
                       const updatedUser = await prisma.user.update({
                         where: {id: ctx.auth.user.id},
                         data: {
                           name: `${input.firstName} ${input.lastName}`,
                           image: input.image,
                         },
                         select: {
                           id: true,
                           name: true,
                           email: true,
                           image: true,
                           updatedAt: true,
                         },
                       });

                       return updatedUser;
                     }),
});
