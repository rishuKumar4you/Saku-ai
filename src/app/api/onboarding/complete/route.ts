import {auth} from '@/lib/auth';
import db from '@/lib/db';
import {NextRequest, NextResponse} from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    // Mark onboarding as completed
    await db.user.update({
      where: {id: session.user.id},
      data: {onboardingCompleted: true},
    });

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
