import {auth} from '@/lib/auth';
import db from '@/lib/db';
import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const user = await db.user.findUnique({
      where: {id: session.user.id},
      select: {onboardingCompleted: true},
    });

    return NextResponse.json(
        {onboardingCompleted: user?.onboardingCompleted || false});
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
