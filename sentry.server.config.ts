// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn:
      'https://0cd0092e8cbdc37d3efe9e9488c7e803@o4510235352104960.ingest.de.sentry.io/4510235367374928',


  integrations: [
    // Add the Vercel AI SDK integration to sentry.server.config.ts
    Sentry.vercelAIIntegration({
      recordInputs: true,
      recordOutputs: true,
    }),

    Sentry.consoleLoggingIntegration({levels: ['log', 'warn', 'error']}),
  ],
  // Define how likely traces are sampled. Adjust this value in production, or
  // use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
