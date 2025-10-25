import {Polar} from '@polar-sh/sdk'

// Debug information
const debugInfo = {
  NODE_ENV: process.env.NODE_ENV,
  POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN ? 'Set' : 'Not set',
  TOKEN_LENGTH: process.env.POLAR_ACCESS_TOKEN?.length || 0,
  TOKEN_PREFIX: process.env.POLAR_ACCESS_TOKEN?.substring(0, 10) || 'none',
};

console.log('🔍 Polar Client Debug:', debugInfo);

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: 'sandbox',
});