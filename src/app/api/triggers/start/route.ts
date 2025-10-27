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

    const {workflowId, nodeId, nodeType, nodeData} = await request.json() as {
      workflowId: string;
      nodeId: string;
      nodeType: string;
      nodeData: any;
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

    // Start the appropriate trigger monitor
    let eventName = '';
    if (nodeType === 'EMAIL_TRIGGER') {
      eventName = 'workflow/email-trigger/start';
    } else if (nodeType === 'SCHEDULE_TRIGGER') {
      eventName = 'workflow/schedule-trigger/start';
    } else {
      return NextResponse.json({error: 'Invalid trigger type'}, {status: 400});
    }

    // Send event to Inngest to start the monitor
    await inngest.send({
      name: eventName,
      data: {
        workflowId,
        userId: session.user.id,
        nodeId,
        nodeData,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${nodeType} monitor started successfully`,
    });
  } catch (error) {
    console.error('Error starting trigger:', error);
    return NextResponse.json(
        {
          error: 'Failed to start trigger',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        {status: 500});
  }
}
