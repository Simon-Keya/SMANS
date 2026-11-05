// lib/rate-limit.ts
// Rate limiter that fails closed when ENABLE_RATELIMIT=true but Redis is missing.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ENABLE_RATELIMIT = process.env.ENABLE_RATELIMIT === "true";
const hasRedisConfig =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let ratelimit: Ratelimit | { limit: (id: string) => Promise<{ success: boolean }> };

if (ENABLE_RATELIMIT) {
  if (!hasRedisConfig) {
    // Fail closed: do not silently allow unlimited requests when rate limiting
    // was intentionally enabled but Redis credentials are missing.
    console.error(
      "[rate-limit] ENABLE_RATELIMIT=true but UPSTASH_REDIS_REST_URL/TOKEN missing. " +
        "All rate-limited endpoints will reject requests until Redis is configured."
    );
    ratelimit = {
      limit: async () => ({ success: false }),
    };
  } else {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "smans:ratelimit",
    });
  }
} else {
  // Explicitly disabled (dev / tests) — allow through
  ratelimit = {
    limit: async () => ({ success: true }),
  };
}

export { ratelimit };

/**
 * Apply rate limit for the given identifier.
 * Throws when limited or when rate limiting is enabled but misconfigured.
 */
export async function applyRateLimit(identifier: string): Promise<void> {
  if (!ENABLE_RATELIMIT) {
    return;
  }

  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    throw new Error("Rate limit exceeded. Try again later.");
  }
}
