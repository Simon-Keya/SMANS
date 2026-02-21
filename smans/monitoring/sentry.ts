// monitoring/sentry.ts - Sentry initialization (optional)
import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: true,
        }),
      ],
    });
  }
}

// Call this in your root layout or _app
// initSentry();