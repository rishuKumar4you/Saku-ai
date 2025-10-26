import {polarClient} from '@polar-sh/better-auth';
import {createAuthClient} from 'better-auth/react';

export const authClient = createAuthClient({
  // Use NEXT_PUBLIC_APP_URL for client-side, fallback to localhost for development
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  plugins: [polarClient()],


});

export const signIn = async () => {
  const data = await authClient.signIn.social({
    provider: 'google',
  });
};