import { NextResponse } from 'next/server';

export async function GET() {
  const debugInfo = {
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN ? 'Set' : 'Not set',
    POLAR_TOKEN_LENGTH: process.env.POLAR_ACCESS_TOKEN?.length || 0,
    POLAR_TOKEN_PREFIX: process.env.POLAR_ACCESS_TOKEN?.substring(0, 10) || 'none',
    POLAR_SUCCESS_URL: process.env.POLAR_SUCCESS_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? 'Set' : 'Not set',
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
  };

  return NextResponse.json(debugInfo);
}
