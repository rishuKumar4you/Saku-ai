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

    const {triggerId} = await request.json() as {
      triggerId: string;
    };

    // Get trigger and verify it belongs to user
    const trigger = await prisma.workflowTrigger.findUnique({
      where: {id: triggerId},
      include: {workflow: true},
    });

    if (!trigger) {
      return NextResponse.json({error: 'Trigger not found'}, {status: 404});
    }

    if (trigger.workflow.userId !== session.user.id) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    // Update trigger status to STOPPED
    await prisma.workflowTrigger.update({
      where: {id: triggerId},
      data: {status: 'STOPPED'},
    });

    // Send cancel event to stop the trigger monitor
    await inngest.send({
      name: 'workflow/trigger/stop',
      data: {
        triggerId,
        workflowId: trigger.workflowId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Trigger monitor stopped successfully',
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
