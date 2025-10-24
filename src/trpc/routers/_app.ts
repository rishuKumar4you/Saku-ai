import {userSettingsRouter} from '@/features/settings/server/user-settings';
import {workflowsRouter} from '@/features/workflows/server/routers';

import {createTRPCRouter} from '../init';

export const appRouter = createTRPCRouter({

  workflows: workflowsRouter,
  userSettings: userSettingsRouter,


});
// export type definition of API
export type AppRouter = typeof appRouter;