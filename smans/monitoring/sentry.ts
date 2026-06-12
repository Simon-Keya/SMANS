// monitoring/sentry.ts - Sentry initialization
import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  // Skip if not in production or missing DSN
  if (process.env.NODE_ENV !== "production" || !process.env.SENTRY_DSN) {
    console.log("Sentry not initialized: Not in production or missing DSN");
    return;
  }

  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.5, // Lower to 0.5 in production to reduce volume
      environment: process.env.NODE_ENV,
      // Only enable debug in development (but we're in production here, so false)
      debug: false,
      // Performance monitoring
      profilesSampleRate: 0.5,
      // Session replay (for client-side errors)
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
    
    console.log("Sentry initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Sentry:", error);
  }
}

// Export Sentry instance for manual error logging
export { Sentry };

// Helper function to capture errors
export function captureError(error: Error | string, context?: Record<string, any>) {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    if (typeof error === "string") {
      Sentry.captureMessage(error, {
        extra: context,
      });
    } else {
      Sentry.captureException(error, {
        extra: context,
      });
    }
  } else {
    console.error("[Sentry]", error, context);
  }
}

// Helper function to set user context
export function setUserContext(user: { id: string; email?: string; role?: string }) {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}

// Helper function to clear user context (on logout)
export function clearUserContext() {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    Sentry.setUser(null);
  }
}

// Call this in your root layout or _app
// initSentry();