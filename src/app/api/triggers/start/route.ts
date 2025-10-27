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

    // Validate trigger type
    if (nodeType !== 'EMAIL_TRIGGER' && nodeType !== 'SCHEDULE_TRIGGER') {
      return NextResponse.json({error: 'Invalid trigger type'}, {status: 400});
    }

    // Create or update trigger record
    const trigger = await prisma.workflowTrigger.upsert({
      where: {
        workflowId_nodeId: {
          workflowId,
          nodeId,
        },
      },
      create: {
        workflowId,
        nodeId,
        triggerType: nodeType,
        config: nodeData,
        status: 'ACTIVE',
      },
      update: {
        config: nodeData,
        status: 'ACTIVE',
      },
    });

    // Start the appropriate trigger monitor
    const eventName = nodeType === 'EMAIL_TRIGGER' ?
        'workflow/email-trigger/start' :
        'workflow/schedule-trigger/start';

    // Send event to Inngest to start the monitor
    await inngest.send({
      name: eventName,
      data: {
        workflowId,
        userId: session.user.id,
        nodeId,
        nodeData,
        triggerId: trigger.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${nodeType} monitor started successfully`,
      triggerId: trigger.id,
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
