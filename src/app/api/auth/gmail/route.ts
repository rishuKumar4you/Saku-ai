import {CredentialType} from '@/generated/prisma';
import {auth} from '@/lib/auth';
import prisma from '@/lib/db';
import {headers} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  // Get base URL once for the entire function - outside try-catch so it's accessible everywhere
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const {searchParams} = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${baseUrl}/settings/credentials?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      // Initiate OAuth flow
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
      authUrl.searchParams.set('redirect_uri', `${baseUrl}/api/auth/gmail`);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set(
          'scope',
          'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', session.user.id);

      return NextResponse.redirect(authUrl.toString());
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${baseUrl}/api/auth/gmail`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Store tokens in database
    await prisma.credential.upsert({
      where: {
        userId_type: {
          userId: session.user.id,
          type: CredentialType.GMAIL_OAUTH,
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in ?
            new Date(Date.now() + tokens.expires_in * 1000) :
            null,
        scope: tokens.scope,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        type: CredentialType.GMAIL_OAUTH,
        name: 'Gmail OAuth',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in ?
            new Date(Date.now() + tokens.expires_in * 1000) :
            null,
        scope: tokens.scope,
        isActive: true,
      },
    });

    return NextResponse.redirect(`${baseUrl}/settings/credentials?success=gmail_connected`);

  } catch (error) {
    console.error('Gmail OAuth error:', error);
    return NextResponse.redirect(`${baseUrl}/settings/credentials?error=oauth_failed`);
  }
}
