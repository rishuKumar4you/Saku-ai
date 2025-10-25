import prisma from '@/lib/db';
import {checkout, polar, portal} from '@polar-sh/better-auth';
import {betterAuth} from 'better-auth';
import {prismaAdapter} from 'better-auth/adapters/prisma';

import {polarClient} from './polar';

export const auth = betterAuth({
  // Your BetterAuth configuration here
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  
  database: prismaAdapter(prisma, {
    provider: 'postgresql',

  }),

  trustedOrigins: [
    'https://saku-ai.vercel.app',
    'https://saku-ai-ksinghal609-gmailcoms-projects.vercel.app',
    process.env.BETTER_AUTH_URL || '',
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || '',
    'http://localhost:3000',
  ].filter(Boolean),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  socialProviders: {
    google: {
      prompt: 'select_account',
      // accessType: 'offline',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
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
