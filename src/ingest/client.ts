import {Inngest} from 'inngest';

export const inngest = new Inngest({
  id: 'Saku-AI',
  // For development, disable the event key requirement
  ...(process.env.NODE_ENV === 'development' &&
      {
          // In development, we can use a mock or local setup
      }),
});
