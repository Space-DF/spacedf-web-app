// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const isProd = process.env.NODE_ENV === 'production'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV,

  enabled: process.env.NODE_ENV !== 'development',

  integrations: [Sentry.replayIntegration()],

  tracesSampleRate: isProd ? 0.1 : 1.0,

  enableLogs: true,

  replaysSessionSampleRate: isProd ? 0.1 : 1.0,

  replaysOnErrorSampleRate: 1.0,

  sendDefaultPii: true,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
