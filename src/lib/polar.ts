import {Polar} from '@polar-sh/sdk'

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  // Use sandbox for now - change to production when you have production tokens
  server: 'sandbox',
});