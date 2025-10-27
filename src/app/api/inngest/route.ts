import {inngest} from '@/ingest/client';
import {emailTriggerMonitor, execute, executeWorkflow, scheduleTriggerMonitor,} from '@/ingest/functions';
import {serve} from 'inngest/next';

export const {GET, POST, PUT} = serve({
  client: inngest,
  functions: [
    execute,
    executeWorkflow,
    emailTriggerMonitor,
    scheduleTriggerMonitor,
  ],
});