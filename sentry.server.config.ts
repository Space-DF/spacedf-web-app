// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const isProd = process.env.NODE_ENV === 'production'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.NODE_ENV,

  enabled: process.env.NODE_ENV !== 'development',

  tracesSampleRate: isProd ? 0.1 : 1.0,

  enableLogs: true,

  sendDefaultPii: true,
})
