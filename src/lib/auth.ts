import prisma from '@/lib/db';
import {checkout, polar, portal} from '@polar-sh/better-auth';
import {betterAuth} from 'better-auth';
import {prismaAdapter} from 'better-auth/adapters/prisma';

import {polarClient} from './polar';

export const auth = betterAuth({
  // Your BetterAuth configuration here
  database: prismaAdapter(prisma, {
    provider: 'postgresql',

  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [polar({
    client: polarClient,
    createCustomerOnSignUp: true,
    use: [
      checkout({
        products: [{
          productId: 'be70b7be-be9a-4101-be83-73dd38c3cda0',
          slug: 'pro',
        }],
        successUrl: process.env.POLAR_SUCCESS_URL,
        authenticatedUsersOnly: true,

      }),
      portal(),
    ],
  })],
});
