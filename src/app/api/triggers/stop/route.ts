import {inngest} from '@/ingest/client';
import {auth} from '@/lib/auth';
import prisma from '@/lib/db';
import {headers} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const {workflowId} = await request.json() as {
      workflowId: string;
    };

    // Verify workflow belongs to user
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: session.user.id,
      },
    });

    if (!workflow) {
      return NextResponse.json({error: 'Workflow not found'}, {status: 404});
    }

    // Send cancel event to stop all triggers for this workflow
    await inngest.send({
      name: 'workflow/cancel',
      data: {
        workflowId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Trigger monitors stopped successfully',
    });
  } catch (error) {
    console.error('Error stopping trigger:', error);
    return NextResponse.json(
        {
          error: 'Failed to stop trigger',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        {status: 500});
  }
}
