import {credentialsRouter} from '@/features/credentials/server/routers';
import {executionsRouter} from '@/features/executions/server/routers';
import {userSettingsRouter} from '@/features/settings/server/user-settings';
import {workflowsRouter} from '@/features/workflows/server/routers';

import {createTRPCRouter} from '../init';

export const appRouter = createTRPCRouter({

  workflows: workflowsRouter,
  userSettings: userSettingsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter,


});
// export type definition of API
export type AppRouter = typeof appRouter;