import prisma from '@/lib/db';
import {polarClient} from '@/lib/polar';
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

  getSessions: protectedProcedure.query(async ({ctx}) => {
    const sessions = await prisma.session.findMany({
      where: {userId: ctx.auth.user.id},
      select: {
        id: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        ipAddress: true,
        userAgent: true,
      },
      orderBy: {updatedAt: 'desc'},
    });

    return sessions.map(
        session => ({
          id: session.id,
          device: getDeviceFromUserAgent(session.userAgent),
          location: getLocationFromIP(session.ipAddress),
          status: session.id === ctx.auth.session?.id ? 'current' : 'active',
          lastActive: formatLastActive(session.updatedAt),
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
        }));
  }),

  deleteSession: protectedProcedure.input(z.object({sessionId: z.string()}))
                     .mutation(async ({ctx, input}) => {
                       // Don't allow deleting the current session
                       if (input.sessionId === ctx.auth.session?.id) {
                         throw new Error('Cannot delete current session');
                       }

                       await prisma.session.delete({
                         where: {id: input.sessionId, userId: ctx.auth.user.id},
                       });

                       return {success: true};
                     }),

  deleteAllSessions: protectedProcedure.mutation(async ({ctx}) => {
    const currentSessionId = ctx.auth.session?.id;

    await prisma.session.deleteMany({
      where: {
        userId: ctx.auth.user.id,
        ...(currentSessionId && {id: {not: currentSessionId}}),
      },
    });

    return {success: true};
  }),

  deleteAccount: protectedProcedure.mutation(async ({ctx}) => {
    try {
      // First, try to delete the Polar customer if it exists
      try {
        // Get user's email to find Polar customer
        const user = await prisma.user.findUnique({
          where: {id: ctx.auth.user.id},
          select: {email: true},
        });

        console.log(
            `Attempting to delete Polar customer for user: ${user?.email}`);
        console.log(`Polar access token configured: ${
            !!process.env.POLAR_ACCESS_TOKEN}`);
            console.log(`Polar client initialized: ${!!polarClient}`);

            if (user?.email) {
              // Try multiple approaches to find the Polar customer
              let customer = null;

              // Approach 1: Search by exact email
              console.log(`Searching for customer by email: ${user.email}`);
              const customersByEmail = await polarClient.customers.list({
                email: user.email,
              });
              console.log(`Found ${
                  customersByEmail.items?.length || 0} customers by email`);

              if (customersByEmail.items && customersByEmail.items.length > 0) {
                customer = customersByEmail.items[0];
              } else {
                // Approach 2: Search by query (name, email, or external ID)
                console.log(`Searching for customer by query: ${user.email}`);
                const customersByQuery = await polarClient.customers.list({
                  query: user.email,
                });
                console.log(`Found ${
                    customersByQuery.items?.length || 0} customers by query`);

                if (customersByQuery.items &&
                    customersByQuery.items.length > 0) {
                  customer = customersByQuery.items[0];
                } else {
                  // Approach 3: List all customers and search manually
                  console.log(`Listing all customers to find by email`);
                  const allCustomers = await polarClient.customers.list({});
                  console.log(`Total customers found: ${
                      allCustomers.items?.length || 0}`);

                  if (allCustomers.items) {
                    customer =
                        allCustomers.items.find(c => c.email === user.email);
                    if (customer) {
                      console.log(
                          `Found customer in full list: ${customer.id}`);
                    }
                  }
                }
              }

              if (customer) {
                console.log(`Attempting to delete Polar customer: ${
                    customer.id} (email: ${customer.email})`);

                // Delete the Polar customer using the correct method
                await polarClient.customers.delete({id: customer.id});
                console.log(
                    `Successfully deleted Polar customer: ${customer.id}`);
              } else {
                console.log(`No Polar customer found for email: ${user.email}`);
                console.log(
                    `This might mean the customer was created with a different email or doesn't exist in Polar`);
              }
            }
      } catch (polarError) {
        console.error('Failed to delete Polar customer:', polarError);
        console.error('Polar error details:', {
          message: polarError instanceof Error ? polarError.message :
                                                 'Unknown error',
          stack: polarError instanceof Error ? polarError.stack : undefined,
          response: polarError?.response || undefined
        });
        // Continue with account deletion even if Polar deletion fails
      }

      // Delete user and all related data (cascade will handle sessions,
      // accounts, etc.)
      await prisma.user.delete({
        where: {id: ctx.auth.user.id},
      });

      return {success: true};
    } catch (error) {
      console.error('Account deletion error:', error);
      throw new Error('Failed to delete account');
    }
  }),
});

// Helper functions
function getDeviceFromUserAgent(userAgent: string|null): string {
  if (!userAgent) return 'Unknown Device';

  // More accurate browser detection
  if (userAgent.includes('Edg/')) return 'Microsoft Edge';
  if (userAgent.includes('OPR/') || userAgent.includes('Opera/'))
    return 'Opera';
  if (userAgent.includes('Firefox/')) return 'Mozilla Firefox';
  if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/'))
    return 'Google Chrome';
  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/'))
    return 'Safari';
  if (userAgent.includes('Mobile/')) return 'Mobile Browser';
  if (userAgent.includes('Android')) return 'Android Browser';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad'))
    return 'iOS Safari';

  return 'Unknown Browser';
}

function getLocationFromIP(ipAddress: string|null): string {
  if (!ipAddress) return 'Unknown Location';

  // Basic IP address parsing for display
  // In a real app, you'd use a geolocation service like ipapi.co or ipinfo.io
  const ipParts = ipAddress.split('.');
  if (ipParts.length === 4) {
    // Show partial IP for privacy (e.g., 192.168.x.x)
    return `${ipParts[0]}.${ipParts[1]}.x.x`;
  }

  return ipAddress;
}

function formatLastActive(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Active just now';
  if (diffMinutes < 60) return `Active ${diffMinutes} minutes ago`;
  if (diffHours < 24) return `Active ${diffHours} hours ago`;
  if (diffDays < 7) return `Active ${diffDays} days ago`;

  return `Active ${Math.floor(diffDays / 7)} weeks ago`;
}
