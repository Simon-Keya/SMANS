// lib/rate-limit.ts
// Simple in-memory rate limiter (for dev) - use Upstash/Redis in production

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if we should enable Redis/Upstash
const ENABLE_RATELIMIT = process.env.ENABLE_RATELIMIT === "true";
const hasRedisConfig = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Only create Redis client if enabled and configured
const redis = ENABLE_RATELIMIT && hasRedisConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : undefined;

// Create rate limiter or fallback to no-op
export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "smans:ratelimit",
    })
  : {
      limit: async (identifier: string) => ({
        success: true,
        pending: Promise.resolve(),
        reset: Date.now() + 60000,
      }),
    };

// Usage in action or route:
export async function applyRateLimit(identifier: string) {
  // Skip rate limiting if disabled
  if (!ENABLE_RATELIMIT) {
    return;
  }

  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    throw new Error("Rate limit exceeded. Try again later.");
  }
}

// Example: limit login attempts by IP
// await applyRateLimit(`login:${ip}`);