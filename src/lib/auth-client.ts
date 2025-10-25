import {polarClient} from '@polar-sh/better-auth';
import {createAuthClient} from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  plugins: [polarClient()],
});

export const signIn = async () => {
  const data = await authClient.signIn.social({
    provider: 'google',
  });
};