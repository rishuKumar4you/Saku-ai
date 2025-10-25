import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);

// Force this route to be dynamic to avoid caching issues
export const dynamic = 'force-dynamic';