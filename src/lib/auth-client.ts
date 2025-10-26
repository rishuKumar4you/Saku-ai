import {polarClient} from '@polar-sh/better-auth';
import {createAuthClient} from 'better-auth/react';

// Get the base URL dynamically
const getBaseURL = () => {
  // If we're on the client side, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // For server-side, use environment variable or fallback
  return process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [polarClient()],
});

export const signIn = async () => {
  const data = await authClient.signIn.social({
    provider: 'google',
  });
};